import { db } from "@/db";
import { tenderCriteria, tenderFields, tenders, bidScores, tenderResults, blockchainTransactions, tenderParticipants, organizationMembers } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import type { TenderModel } from "./model";
import { contract } from "@/lib/web3";
import { NotificationService } from "../notifications/service";

export abstract class TenderService {
    static async create(data: TenderModel.createInput & { createdBy: string }) {

        const tenderId = crypto.randomUUID();
        const now = new Date();
        const commitDeadlineDate = new Date(data.commitDeadline);
        const revealWindowHours = data.revealWindowHours ?? 48;
        const revealDeadlineDate = new Date(commitDeadlineDate.getTime() + revealWindowHours * 60 * 60 * 1000);

        await db.insert(tenders).values({
            id: tenderId,
            organizationId: data.organizationId,
            createdBy: data.createdBy,
            code: data.code,
            title: data.title,
            description: data.description,
            attachments: data.attachments || [],
            category: data.category,
            status: "DRAFT",
            commitDeadline: commitDeadlineDate,
            revealWindowHours,
            revealDeadline: revealDeadlineDate,
            createdAt: now,
            updatedAt: now,
        });

        return { id: tenderId };
    }

    static async update(id: string, data: TenderModel.updateInput) {
        const tender = await db.query.tenders.findFirst({ where: (t, { eq }) => eq(t.id, id) });
        if (!tender) throw new Error("Tender not found");
        if (tender.status !== "DRAFT") throw new Error("Only tenders in DRAFT status can be updated");

        const updatePayload: any = { updatedAt: new Date() };
        if (data.title !== undefined) updatePayload.title = data.title;
        if (data.description !== undefined) updatePayload.description = data.description;
        if (data.category !== undefined) updatePayload.category = data.category;
        if (data.attachments !== undefined) updatePayload.attachments = data.attachments;
        
        let newCommitDeadline = tender.commitDeadline;
        if (data.commitDeadline !== undefined) {
            newCommitDeadline = new Date(data.commitDeadline);
            updatePayload.commitDeadline = newCommitDeadline;
        }

        let newRevealWindow = tender.revealWindowHours;
        if (data.revealWindowHours !== undefined) {
            newRevealWindow = data.revealWindowHours;
            updatePayload.revealWindowHours = newRevealWindow;
        }

        if (data.commitDeadline !== undefined || data.revealWindowHours !== undefined) {
            updatePayload.revealDeadline = new Date(newCommitDeadline.getTime() + newRevealWindow * 60 * 60 * 1000);
        }

        await db.update(tenders).set(updatePayload).where(eq(tenders.id, id));
        return { id };
    }

    static isBulkUpdating = false;

    static async performBulkStatusUpdates() {
        if (this.isBulkUpdating) return;
        this.isBulkUpdating = true;
        const now = new Date();
        try {
            // Bulk update to REVEAL
            const updatedToReveal = await db.execute(sql`
                UPDATE tenders 
                SET status = 'REVEAL', closed_at = ${now}, updated_at = ${now}
                WHERE status = 'OPEN' AND commit_deadline < ${now}
                RETURNING id, title
            `);

            if (updatedToReveal.rows.length > 0) {
                // Notifikasi ke partisipan (vendor) bahwa fase reveal dimulai
                for (const tender of updatedToReveal.rows as any[]) {
                    // Fetch all users belonging to the participating organizations
                    const membersToNotify = await db.select({ userId: organizationMembers.userId })
                        .from(tenderParticipants)
                        .innerJoin(organizationMembers, eq(tenderParticipants.organizationId, organizationMembers.organizationId))
                        .where(eq(tenderParticipants.tenderId, tender.id));
                    
                    if (membersToNotify.length > 0) {
                        const notificationsPayload = membersToNotify.map(m => ({
                            userId: m.userId,
                            title: "Fase Reveal Dimulai!",
                            message: `Waktu commit untuk tender "${tender.title}" telah berakhir. Segera lakukan Dekripsi (Reveal) penawaran Anda sebelum Reveal Deadline berakhir!`,
                            type: "INFO" as const,
                            link: `/tenders/${tender.id}`
                        }));
                        await NotificationService.createMany(notificationsPayload);
                    }
                }
            }

            // Bulk update to SCORING
            const updatedToScoring = await db.execute(sql`
                UPDATE tenders 
                SET status = 'SCORING', updated_at = ${now}
                WHERE status = 'REVEAL' AND reveal_deadline < ${now}
                RETURNING id, title, created_by
            `);

            if (updatedToScoring.rows.length > 0) {
                // Notifikasi ke panitia (creator) bahwa fase scoring dimulai
                for (const tender of updatedToScoring.rows as any[]) {
                    await NotificationService.create({
                        userId: tender.created_by,
                        title: "Fase Scoring Terbuka",
                        message: `Waktu reveal untuk tender "${tender.title}" telah berakhir. Anda sekarang dapat mulai memberikan penilaian (Scoring) kepada para vendor yang sah.`,
                        type: "INFO",
                        link: `/tenders/${tender.id}`
                    });
                }
            }
        } catch (error) {
            console.error("Bulk lazy update failed:", error);
        } finally {
            this.isBulkUpdating = false;
        }
    }

    private static evaluateStatusInMemory<T extends { status: string, commitDeadline: Date | string, revealDeadline: Date | string | null }>(tender: T): T {
        if (!tender) return tender;
        const now = new Date();
        const commitDate = new Date(tender.commitDeadline);
        const revealDate = tender.revealDeadline ? new Date(tender.revealDeadline) : null;
        
        let newStatus = tender.status;
        if (tender.status === "OPEN" && commitDate < now) {
            newStatus = "REVEAL";
        } else if (tender.status === "REVEAL" && revealDate && revealDate < now) {
            newStatus = "SCORING";
        }
        
        if (newStatus !== tender.status) {
            return { ...tender, status: newStatus };
        }
        return tender;
    }

    static async getAll(page = 1, limit = 20) {
        // Fire and forget bulk updates to prevent pool starvation
        TenderService.performBulkStatusUpdates().catch(console.error);

        const offset = (page - 1) * limit;

        const results = await db.execute(sql`
            SELECT 
                t.id, t.code, t.title, t.description, t.category, t.status, 
                t.commit_deadline as "commitDeadline", t.reveal_deadline as "revealDeadline", 
                t.reveal_window_hours as "revealWindowHours", t.created_at as "createdAt", 
                t.organization_id as "organizationId",
                json_build_object('id', o.id, 'name', o.name) as organization,
                COALESCE((
                    SELECT json_agg(json_build_object('organizationId', p.organization_id)) 
                    FROM tender_participants p 
                    WHERE p.tender_id = t.id
                ), '[]'::json) as participants,
                COALESCE((
                    SELECT json_agg(json_build_object('id', b.id)) 
                    FROM bids b 
                    WHERE b.tender_id = t.id
                ), '[]'::json) as bids
            FROM tenders t
            LEFT JOIN organizations o ON t.organization_id = o.id
            ORDER BY t.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
        `);
        
        const countResult = await db.execute(sql`SELECT count(*) from tenders`);
        const rowsCount = (countResult as any).rows || countResult;
        const total = parseInt(rowsCount[0]?.count || "0", 10);

        // node-postgres returns rows array
        const rows = (results as any).rows || results;
        const mappedData = rows.map((t: any) => TenderService.evaluateStatusInMemory(t));

        return {
            data: mappedData,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    static async getById(id: string) {
        let tender = await db.query.tenders.findFirst({
            where: (t, { eq }) => eq(t.id, id),
            with: {
                organization: true,
                creator: true,
            },
        });

        if (!tender) return null;
        
        // Ensure accurate status
        await TenderService.performBulkStatusUpdates().catch(console.error);
        tender = TenderService.evaluateStatusInMemory(tender as any);

        const [fields, criteria, participants] = await Promise.all([
            db.query.tenderFields.findMany({
                where: (f, { eq }) => eq(f.tenderId, id),
            }),
            db.query.tenderCriteria.findMany({
                where: (c, { eq }) => eq(c.tenderId, id),
            }),
            db.query.tenderParticipants.findMany({
                where: (p, { eq }) => eq(p.tenderId, id),
                with: {
                    organization: true,
                },
            })
        ]);

        return {
            ...tender,
            fields,
            criteria,
            participants,
        };
    }

    static async updateStatus(id: string, status: TenderModel.updateStatusInput["status"]) {
        const now = new Date();
        const updatePayload: Record<string, unknown> = {
            status,
            updatedAt: now,
        };

        if (status === "OPEN") {
            updatePayload.openedAt = now;
            // Create tender on Smart Contract
            const tender = await db.query.tenders.findFirst({ where: (t, { eq }) => eq(t.id, id) });
            if (tender && tender.commitDeadline) {
                try {
                    const { provider, relayerWallet, contract } = await import("@/lib/web3");
                    const nonce = await provider.getTransactionCount(relayerWallet.address, "latest");
                    const tx = await contract.createTender(id, Math.floor(tender.commitDeadline.getTime() / 1000), { nonce });
                    // Fire and forget mining wait
                    tx.wait().catch((err: any) => console.error("Tender mining failed:", err));
                } catch (err: any) {
                    if (err.reason === "Tender already exists" || (err.message && err.message.includes("Tender already exists"))) {
                        console.warn("Tender already exists on blockchain, continuing with status update.");
                    } else {
                        console.error("Failed to create tender on smart contract:", err);
                        console.error("Error details:", err.message, err.stack);
                        throw new Error("Gagal mendaftarkan tender ke Blockchain. Pastikan koneksi Hardhat Node berjalan dengan baik. Detail: " + (err.message || ""));
                    }
                }
            }
        } else if (status === "CLOSED") {
            updatePayload.closedAt = now;
        } else if (status === "COMPLETED") {
            updatePayload.completedAt = now;
        }

        await db.update(tenders).set(updatePayload).where(eq(tenders.id, id));

        // Notifications
        if (status === "REVEAL") {
            const tenderInfo = await db.query.tenders.findFirst({ where: (t, { eq }) => eq(t.id, id) });
            const allBids = await db.query.bids.findMany({
                where: (b, { eq }) => eq(b.tenderId, id)
            });
            
            const orgIds = allBids.map(b => b.organizationId);
            if (orgIds.length > 0) {
                const members = await db.query.organizationMembers.findMany({
                    where: (m, { inArray, eq, and }) => and(inArray(m.organizationId, orgIds), eq(m.status, "ACTIVE"))
                });
                
                const notificationsPayload = members.map(member => ({
                    userId: member.userId,
                    title: "Fase Reveal Dibuka!",
                    message: `Tender ${tenderInfo?.code} telah memasuki fase REVEAL. Segera decrypt dokumen penawaran Anda!`,
                    type: "INFO" as const,
                    link: `/tenders/${id}`
                }));
                
                await NotificationService.createMany(notificationsPayload);
            }
        }
    }

    static async addField(tenderId: string, data: TenderModel.addFieldInput) {
        const fieldId = crypto.randomUUID();
        await db.insert(tenderFields).values({
            id: fieldId,
            tenderId,
            name: data.name,
            key: data.key,
            type: data.type,
            required: data.required ?? true,
            options: data.options,
            validationRules: data.validationRules,
            sortOrder: data.sortOrder ?? 0,
            createdAt: new Date(),
        });

        return { id: fieldId };
    }

    static async addCriterion(tenderId: string, data: TenderModel.addCriterionInput) {
        const criterionId = crypto.randomUUID();
        const now = new Date();

        await db.insert(tenderCriteria).values({
            id: criterionId,
            tenderId,
            name: data.name,
            description: data.description,
            weight: data.weight.toString(),
            scoringType: data.scoringType ?? "MANUAL",
            maxScore: (data.maxScore ?? 100).toString(),
            sortOrder: data.sortOrder ?? 0,
            createdAt: now,
            updatedAt: now,
        });

        return { id: criterionId };
    }
    static async finalizeTender(tenderId: string, payload: TenderModel.finalizeInput, userId: string) {
        const tender = await db.query.tenders.findFirst({
            where: (t, { eq }) => eq(t.id, tenderId),
        });

        if (!tender) throw new Error("Tender not found");
        if (tender.status !== "SCORING") {
            throw new Error("Tender can only be finalized if its status is SCORING");
        }

        const now = new Date();

        // 1. Transaction to save all scores, results, and mock blockchain
        await db.transaction(async (tx) => {
            // A. Save Scores for each bid
            const scoreValues = [];
            for (const bid of payload.bids) {
                for (const score of bid.criteriaScores) {
                    scoreValues.push({
                        id: crypto.randomUUID(),
                        bidId: bid.bidId,
                        criterionId: score.criterionId,
                        rawScore: score.rawScore.toString(),
                        weightedScore: score.weightedScore.toString(),
                        scoredBy: userId,
                        createdAt: now,
                        updatedAt: now,
                    });
                }
            }
            if (scoreValues.length > 0) {
                await tx.insert(bidScores).values(scoreValues);
            }

            // B. Send Final Result to Smart Contract
            let txHash = `0xmocktxhash${crypto.randomUUID().replace(/-/g, "")}`;
            try {
                const winningBid = await db.query.bids.findFirst({ where: (b, { eq }) => eq(b.id, payload.winningBidId) });
                if (winningBid) {
                    const scTx = await contract.finalizeTender(tenderId, winningBid.organizationId, payload.finalScore.toString());
                    const receipt = await scTx.wait();
                    txHash = receipt.hash;
                }
            } catch (err) {
                console.error("Failed to finalize tender on smart contract:", err);
            }

            await tx.insert(tenderResults).values({
                id: crypto.randomUUID(),
                tenderId,
                winningBidId: payload.winningBidId,
                finalScore: payload.finalScore.toString(),
                decidedBy: userId,
                decidedAt: now,
                blockchainTxHash: txHash,
                createdAt: now,
            });

            // C. Blockchain Transaction Record
            await tx.insert(blockchainTransactions).values({
                id: crypto.randomUUID(),
                tenderId,
                bidId: payload.winningBidId,
                transactionType: "RESULT",
                txHash: txHash,
                chainId: 31337,
                contractAddress: await contract.getAddress(),
                blockNumber: 0,
                blockTimestamp: now,
                metadata: {
                    action: "finalize",
                    winningBidId: payload.winningBidId,
                    finalScore: payload.finalScore
                },
                createdAt: now,
            });

            // D. Update Tender Status
            await tx.update(tenders).set({
                status: "COMPLETED",
                completedAt: now,
                updatedAt: now,
            }).where(eq(tenders.id, tenderId));
        });

        // E. Send Notifications
        try {
            const bidIds = payload.bids.map(b => b.bidId);
            if (bidIds.length > 0) {
                const allBids = await db.query.bids.findMany({
                    where: (b, { inArray }) => inArray(b.id, bidIds)
                });
                const orgIds = allBids.map(b => b.organizationId);
                
                if (orgIds.length > 0) {
                    const members = await db.query.organizationMembers.findMany({
                        where: (m, { inArray, eq, and }) => and(inArray(m.organizationId, orgIds), eq(m.status, "ACTIVE"))
                    });
                    
                    const orgToMembers = new Map<string, typeof members>();
                    members.forEach(m => {
                        if (!orgToMembers.has(m.organizationId)) orgToMembers.set(m.organizationId, []);
                        orgToMembers.get(m.organizationId)!.push(m);
                    });

                    const notificationsPayload = [];
                    for (const bid of allBids) {
                        const isWinner = bid.id === payload.winningBidId;
                        const orgMembers = orgToMembers.get(bid.organizationId) || [];
                        for (const member of orgMembers) {
                            notificationsPayload.push({
                                userId: member.userId,
                                title: isWinner ? "Selamat! Anda Memenangkan Tender" : "Pengumuman Hasil Tender",
                                message: isWinner 
                                    ? `Organisasi Anda terpilih sebagai pemenang untuk tender ${tender.code} dengan skor akhir ${payload.finalScore}.`
                                    : `Tender ${tender.code} telah selesai. Sayang sekali, organisasi Anda belum berhasil kali ini.`,
                                type: (isWinner ? "SUCCESS" : "INFO") as "SUCCESS" | "INFO",
                                link: `/tenders/${tenderId}`
                            });
                        }
                    }
                    await NotificationService.createMany(notificationsPayload);
                }
            }
        } catch (error) {
            console.error("Failed to send finalization notifications:", error);
        }

        return { success: true };
    }

    static async getAuditData(tenderId: string) {
        const [tender, result, tx, allBids] = await Promise.all([
            db.query.tenders.findFirst({
                where: (t, { eq }) => eq(t.id, tenderId),
            }),
            db.query.tenderResults.findFirst({
                where: (tr, { eq }) => eq(tr.tenderId, tenderId),
            }),
            db.query.blockchainTransactions.findFirst({
                where: (t, { eq }) => eq(t.tenderId, tenderId),
            }),
            db.query.bids.findMany({
                where: (b, { eq }) => eq(b.tenderId, tenderId),
                with: {
                    organization: true,
                    reveal: true,
                }
            })
        ]);

        if (!tender || tender.status !== "COMPLETED") {
            throw new Error("Tender is not completed yet or not found");
        }

        const bidIds = allBids.map(b => b.id);
        
        let allScores: any[] = [];
        if (bidIds.length > 0) {
            allScores = await db.query.bidScores.findMany({
                where: (s, { inArray }) => inArray(s.bidId, bidIds)
            });
        }

        return {
            tender,
            result,
            transaction: tx,
            bids: allBids,
            scores: allScores
        };
    }
}
