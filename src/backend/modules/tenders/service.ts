import { db } from "@/db";
import {
    tenderCriteria,
    tenderFields,
    tenders,
    bidScores,
    tenderResults,
    blockchainTransactions,
    tenderParticipants,
    organizationMembers,
    bids,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { createHash } from "node:crypto";
import type { TenderModel } from "./model";
import { contract } from "@/lib/web3";
import { NotificationService } from "../notifications/service";

export abstract class TenderService {
    private static hashEvidence(value: unknown) {
        return `0x${createHash("sha256").update(JSON.stringify(value)).digest("hex")}`;
    }

    private static scoreKey(score: number) {
        return Number(score.toFixed(2));
    }

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

        if (data.fields !== undefined) {
            await db.delete(tenderFields).where(eq(tenderFields.tenderId, id));
            for (const field of data.fields) {
                await db.insert(tenderFields).values({
                    id: crypto.randomUUID(),
                    tenderId: id,
                    name: field.name,
                    key: field.key,
                    type: field.type,
                    required: field.required ?? true,
                    options: field.options,
                    validationRules: field.validationRules,
                    sortOrder: field.sortOrder ?? 0,
                    createdAt: new Date(),
                });
            }
        }

        if (data.criteria !== undefined) {
            await db.delete(tenderCriteria).where(eq(tenderCriteria.tenderId, id));
            for (const criterion of data.criteria) {
                await db.insert(tenderCriteria).values({
                    id: crypto.randomUUID(),
                    tenderId: id,
                    name: criterion.name,
                    description: criterion.description,
                    weight: criterion.weight.toString(),
                    scoringType: criterion.scoringType ?? "MANUAL",
                    maxScore: (criterion.maxScore ?? 100).toString(),
                    sortOrder: criterion.sortOrder ?? 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
        }

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
                RETURNING id, title, created_by
            `);

            if (updatedToReveal.rows.length > 0) {
                console.log(`[BulkUpdate] ${updatedToReveal.rows.length} tender(s) transitioned to REVEAL`);
                // Notifikasi ke partisipan (vendor) bahwa fase reveal dimulai
                for (const tender of updatedToReveal.rows as any[]) {
                    const creatorId = tender.created_by || tender.createdBy;

                    // Fetch all users belonging to organizations that have submitted a bid OR joined as participant
                    const [bidMembers, participantMembers] = await Promise.all([
                        db
                            .select({ userId: organizationMembers.userId })
                            .from(bids)
                            .innerJoin(organizationMembers, eq(bids.organizationId, organizationMembers.organizationId))
                            .where(eq(bids.tenderId, tender.id)),
                        db
                            .select({ userId: organizationMembers.userId })
                            .from(tenderParticipants)
                            .innerJoin(
                                organizationMembers,
                                eq(tenderParticipants.organizationId, organizationMembers.organizationId),
                            )
                            .where(eq(tenderParticipants.tenderId, tender.id)),
                    ]);

                    // Remove duplicate user IDs
                    const uniqueUserIds = [...new Set([...bidMembers, ...participantMembers].map((m) => m.userId))];

                    if (uniqueUserIds.length > 0) {
                        const notificationsPayload = uniqueUserIds.map((userId) => ({
                            userId: userId,
                            title: "Fase Reveal Dimulai!",
                            message: `Waktu commit untuk tender "${tender.title}" telah berakhir. Segera lakukan Dekripsi (Reveal) penawaran Anda sebelum Reveal Deadline berakhir!`,
                            type: "INFO" as const,
                            link: `/tenders/${tender.id}`,
                        }));
                        await NotificationService.createMany(notificationsPayload);
                        console.log(
                            `[BulkUpdate] Sent reveal notification to ${uniqueUserIds.length} user(s) for tender ${tender.id}`,
                        );
                    }

                    // Notifikasi juga untuk panitia pembuat tender
                    if (creatorId) {
                        await NotificationService.create({
                            userId: creatorId,
                            title: "Fase Reveal Dimulai",
                            message: `Waktu pengumpulan (commit) untuk tender "${tender.title}" telah berakhir. Saat ini vendor sedang melakukan dekripsi penawaran mereka.`,
                            type: "INFO",
                            link: `/tenders/${tender.id}`,
                        });
                        console.log(
                            `[BulkUpdate] Sent reveal notification to creator ${creatorId} for tender ${tender.id}`,
                        );
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
                console.log(`[BulkUpdate] ${updatedToScoring.rows.length} tender(s) transitioned to SCORING`);
                // Notifikasi ke panitia (creator) bahwa fase scoring dimulai
                for (const tender of updatedToScoring.rows as any[]) {
                    const creatorId = tender.created_by || tender.createdBy;
                    if (creatorId) {
                        await NotificationService.create({
                            userId: creatorId,
                            title: "Fase Scoring Terbuka",
                            message: `Waktu reveal untuk tender "${tender.title}" telah berakhir. Anda sekarang dapat mulai memberikan penilaian (Scoring) kepada para vendor yang sah.`,
                            type: "INFO",
                            link: `/tenders/${tender.id}`,
                        });
                        console.log(
                            `[BulkUpdate] Sent scoring notification to creator ${creatorId} for tender ${tender.id}`,
                        );
                    }
                }
            }
        } catch (error) {
            console.error("Bulk lazy update failed:", error);
        } finally {
            this.isBulkUpdating = false;
        }
    }

    private static evaluateStatusInMemory<
        T extends { status: string; commitDeadline: Date | string; revealDeadline: Date | string | null },
    >(tender: T): T {
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
        const offset = (page - 1) * limit;

        const [results, countResult] = await Promise.all([
            db.execute(sql`
            SELECT 
                t.id, t.code, t.title, t.description, t.category, t.status, 
                t.commit_deadline as "commitDeadline", t.reveal_deadline as "revealDeadline", 
                t.reveal_window_hours as "revealWindowHours", t.created_at as "createdAt", 
                t.organization_id as "organizationId",
                json_build_object('id', o.id, 'name', o.name) as organization,
                COALESCE((
                    SELECT array_agg(p.organization_id)
                    FROM tender_participants p 
                    WHERE p.tender_id = t.id
                ), ARRAY[]::text[]) as "participantOrgIds",
                (
                    SELECT count(*)::int
                    FROM bids b 
                    WHERE b.tender_id = t.id
                ) as "bidCount"
            FROM tenders t
            LEFT JOIN organizations o ON t.organization_id = o.id
            ORDER BY t.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
            `),
            db.execute(sql`SELECT count(*) FROM tenders`),
        ]);

        const rowsCount = (countResult as any).rows || countResult;
        const total = parseInt(rowsCount[0]?.count || "0", 10);

        const rows = (results as any).rows || results;
        const mappedData = rows.map((t: any) => TenderService.evaluateStatusInMemory(t));

        return {
            data: mappedData,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
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
            }),
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
            const tender = await db.query.tenders.findFirst({ where: (t, { eq }) => eq(t.id, id) });
            if (tender && tender.commitDeadline) {
                const criteria = await db.query.tenderCriteria.findMany({
                    where: (criterion, { eq }) => eq(criterion.tenderId, id),
                    orderBy: (criterion, { asc }) => [asc(criterion.sortOrder), asc(criterion.id)],
                });
                if (criteria.length === 0) {
                    throw new Error("Tender harus memiliki setidaknya satu kriteria sebelum dipublikasikan.");
                }

                const tieBreakerCriteriaIds = criteria.map((criterion) => criterion.id);
                const tieBreakPolicyHash = TenderService.hashEvidence({
                    version: 1,
                    tieBreakerCriteriaIds,
                });
                updatePayload.tieBreakerCriteriaIds = tieBreakerCriteriaIds;
                updatePayload.tieBreakPolicyHash = tieBreakPolicyHash;

                try {
                    const { provider, relayerWallet, contract } = await import("@/lib/web3");
                    const nonce = await provider.getTransactionCount(relayerWallet.address, "latest");
                    const tx = await contract.createTender(
                        id,
                        Math.floor(tender.commitDeadline.getTime() / 1000),
                        tieBreakPolicyHash,
                        { nonce },
                    );
                    tx.wait().catch((err: any) => console.error("Tender mining failed:", err));
                } catch (err: any) {
                    if (
                        err.reason === "Tender already exists" ||
                        (err.message && err.message.includes("Tender already exists"))
                    ) {
                        console.warn("Tender already exists on blockchain, continuing with status update.");
                    } else {
                        console.error("Failed to create tender on smart contract:", err);
                        console.error("Error details:", err.message, err.stack);
                        throw new Error(
                            "Gagal mendaftarkan tender ke Blockchain. Pastikan koneksi Hardhat Node berjalan dengan baik. Detail: " +
                                (err.message || ""),
                        );
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
                where: (b, { eq }) => eq(b.tenderId, id),
            });

            const orgIds = allBids.map((b) => b.organizationId);
            if (orgIds.length > 0) {
                const members = await db.query.organizationMembers.findMany({
                    where: (m, { inArray, eq, and }) => and(inArray(m.organizationId, orgIds), eq(m.status, "ACTIVE")),
                });

                const notificationsPayload = members.map((member) => ({
                    userId: member.userId,
                    title: "Fase Reveal Dibuka!",
                    message: `Tender ${tenderInfo?.code} telah memasuki fase REVEAL. Segera decrypt dokumen penawaran Anda!`,
                    type: "INFO" as const,
                    link: `/tenders/${id}`,
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

        const now = new Date();
        const commitPassed = tender.commitDeadline && new Date(tender.commitDeadline) < now;
        const revealPassed = tender.revealDeadline && new Date(tender.revealDeadline) < now;

        let effectiveStatus = tender.status;
        if (effectiveStatus === "OPEN" && commitPassed) effectiveStatus = "REVEAL";
        if (effectiveStatus === "REVEAL" && revealPassed) effectiveStatus = "SCORING";

        const [criteria, tenderBids] = await Promise.all([
            db.query.tenderCriteria.findMany({
                where: (criterion, { eq }) => eq(criterion.tenderId, tenderId),
                orderBy: (criterion, { asc }) => [asc(criterion.sortOrder), asc(criterion.id)],
            }),
            db.query.bids.findMany({
                where: (bid, { eq }) => eq(bid.tenderId, tenderId),
            }),
        ]);
        const validBids = tenderBids.filter((bid) => bid.status === "REVEALED_VALID");
        const validBidIds = new Set(validBids.map((bid) => bid.id));

        // Jika tidak ada bid yang valid / tidak ada yang reveal
        if (validBidIds.size === 0) {
            // Bisa diselesaikan jika sudah lewat commit deadline (jika 0 bids) atau sudah lewat reveal deadline / SCORING
            if (effectiveStatus !== "SCORING" && !(effectiveStatus === "REVEAL" && tenderBids.length === 0)) {
                throw new Error("Tender belum dapat diselesaikan karena batas waktu belum berakhir.");
            }

            const evaluationHash = TenderService.hashEvidence({
                tenderId,
                status: "NO_WINNER",
                totalBids: tenderBids.length,
                validBids: 0,
                finalizedAt: now.toISOString(),
            });

            let txHash = `0xmocktxhash${crypto.randomUUID().replace(/-/g, "")}`;
            try {
                const scTx = await contract.finalizeTender(
                    tenderId,
                    "NO_WINNER",
                    "0.00",
                    evaluationHash,
                );
                const receipt = await scTx.wait();
                txHash = receipt.hash;
            } catch (err) {
                console.error("Failed to finalize tender on smart contract (no winner):", err);
            }

            const decisionNotes = tenderBids.length === 0
                ? "Tender diselesaikan tanpa pemenang (tidak ada penawaran yang diajukan oleh vendor)."
                : "Tender diselesaikan tanpa pemenang (tidak ada vendor yang melakukan reveal penawaran secara sah).";

            let contractAddress = "0x0000000000000000000000000000000000000000";
            try {
                contractAddress = await contract.getAddress();
            } catch {
                // fallback
            }

            await db.transaction(async (tx) => {
                await tx.insert(tenderResults).values({
                    id: crypto.randomUUID(),
                    tenderId,
                    winningBidId: null,
                    finalScore: "0.00",
                    decisionNotes,
                    decidedBy: userId,
                    decidedAt: now,
                    blockchainTxHash: txHash,
                    createdAt: now,
                });

                await tx.insert(blockchainTransactions).values({
                    id: crypto.randomUUID(),
                    tenderId,
                    bidId: null,
                    transactionType: "RESULT",
                    txHash: txHash,
                    chainId: 31337,
                    contractAddress,
                    blockNumber: 0,
                    blockTimestamp: now,
                    metadata: {
                        action: "finalize_no_winner",
                        reason: tenderBids.length === 0 ? "NO_BIDS" : "NO_REVEALED_BIDS",
                        winningBidId: null,
                        finalScore: 0,
                        totalBids: tenderBids.length,
                    },
                    createdAt: now,
                });

                await tx
                    .update(tenders)
                    .set({
                        status: "COMPLETED",
                        completedAt: now,
                        updatedAt: now,
                    })
                    .where(eq(tenders.id, tenderId));
            });

            if (tenderBids.length > 0) {
                try {
                    const orgIds = [...new Set(tenderBids.map((b) => b.organizationId))];
                    const members = await db.query.organizationMembers.findMany({
                        where: (m, { inArray, eq, and }) =>
                            and(inArray(m.organizationId, orgIds), eq(m.status, "ACTIVE")),
                    });

                    if (members.length > 0) {
                        const notificationsPayload = members.map((member) => ({
                            userId: member.userId,
                            title: "Pengumuman Hasil Tender",
                            message: `Tender ${tender.code} telah diselesaikan tanpa pemenang (tidak ada penawaran yang di-reveal secara sah).`,
                            type: "INFO" as const,
                            link: `/tenders/${tenderId}`,
                        }));
                        await NotificationService.createMany(notificationsPayload);
                    }
                } catch (error) {
                    console.error("Failed to send no-winner notifications:", error);
                }
            }

            return { success: true, noWinner: true };
        }

        if (effectiveStatus !== "SCORING") {
            throw new Error("Tender can only be finalized if its status is SCORING");
        }

        const submittedBids = payload.bids || [];
        const submittedBidIds = new Set(submittedBids.map((bid) => bid.bidId));

        if (submittedBidIds.size !== submittedBids.length || submittedBidIds.size !== validBidIds.size) {
            throw new Error("Semua bid yang valid harus dinilai tepat satu kali.");
        }
        for (const bidId of submittedBidIds) {
            if (!validBidIds.has(bidId)) throw new Error("Skor hanya dapat disimpan untuk bid yang valid.");
        }

        const criteriaIds = new Set(criteria.map((criterion) => criterion.id));
        for (const bid of submittedBids) {
            const scoredCriteriaIds = new Set(bid.criteriaScores.map((score) => score.criterionId));
            if (scoredCriteriaIds.size !== criteriaIds.size || [...scoredCriteriaIds].some((id) => !criteriaIds.has(id))) {
                throw new Error("Setiap bid harus memiliki skor untuk seluruh kriteria tender.");
            }
        }

        const scoreByBidAndCriterion = new Map(
            submittedBids.map((bid) => [
                bid.bidId,
                new Map(bid.criteriaScores.map((score) => [score.criterionId, TenderService.scoreKey(score.weightedScore)])),
            ]),
        );
        const rankedBids = [...submittedBids].sort((left, right) => right.totalScore - left.totalScore);
        const topScore = TenderService.scoreKey(rankedBids[0]?.totalScore ?? 0);
        let candidates = rankedBids.filter((bid) => TenderService.scoreKey(bid.totalScore) === topScore);
        const tieBreakerCriteriaIds = Array.isArray(tender.tieBreakerCriteriaIds)
            ? (tender.tieBreakerCriteriaIds as string[])
            : criteria.map((criterion) => criterion.id);

        for (const criterionId of tieBreakerCriteriaIds) {
            if (candidates.length < 2) break;
            const highestScore = Math.max(
                ...candidates.map((bid) => scoreByBidAndCriterion.get(bid.bidId)?.get(criterionId) ?? 0),
            );
            candidates = candidates.filter(
                (bid) => (scoreByBidAndCriterion.get(bid.bidId)?.get(criterionId) ?? 0) === highestScore,
            );
        }

        const evaluationHash = TenderService.hashEvidence({
            tenderId,
            tieBreakerCriteriaIds,
            bids: rankedBids.map((bid) => ({
                bidId: bid.bidId,
                totalScore: TenderService.scoreKey(bid.totalScore),
                criteriaScores: bid.criteriaScores.map((score) => ({
                    criterionId: score.criterionId,
                    weightedScore: TenderService.scoreKey(score.weightedScore),
                })),
            })),
        });

        if (candidates.length > 1) {
            const candidateBidIds = candidates.map((bid) => bid.bidId).sort();
            const candidateBidIdsHash = TenderService.hashEvidence(candidateBidIds);

            try {
                const transaction = await contract.recordTie(tenderId, candidateBidIdsHash, evaluationHash);
                await transaction.wait();
            } catch (error) {
                console.error("Failed to record tie on smart contract:", error);
                throw new Error("Gagal mencatat hasil seri ke Blockchain.");
            }

            await db.transaction(async (tx) => {
                const scoreValues = submittedBids.flatMap((bid) =>
                    bid.criteriaScores.map((score) => ({
                        id: crypto.randomUUID(),
                        bidId: bid.bidId,
                        criterionId: score.criterionId,
                        rawScore: score.rawScore.toString(),
                        weightedScore: score.weightedScore.toString(),
                        scoredBy: userId,
                        createdAt: now,
                        updatedAt: now,
                    })),
                );
                await tx.insert(bidScores).values(scoreValues);
                await tx
                    .update(tenders)
                    .set({
                        status: "TIED",
                        tieCandidateBidIds: candidateBidIds,
                        tieBreakEvidenceHash: evaluationHash,
                        updatedAt: now,
                    })
                    .where(eq(tenders.id, tenderId));
            });

            return { status: "TIED", candidateBidIds, evaluationHash };
        }

        const winner = candidates[0];
        if (!winner || payload.winningBidId !== winner.bidId) {
            throw new Error("Pemenang harus sesuai dengan hasil perhitungan skor dan tie-breaker.");
        }
        if (TenderService.scoreKey(payload.finalScore ?? 0) !== topScore) {
            throw new Error("Skor akhir pemenang tidak sesuai dengan hasil perhitungan.");
        }

        // 1. Transaction to save all scores, results, and mock blockchain
        await db.transaction(async (tx) => {
            // A. Save Scores for each bid
            const scoreValues = [];
            for (const bid of submittedBids) {
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
                const scTx = await contract.finalizeTender(
                    tenderId,
                    payload.winningBidId!,
                    (payload.finalScore ?? 0).toFixed(2),
                    evaluationHash,
                );
                const receipt = await scTx.wait();
                txHash = receipt.hash;
            } catch (err) {
                console.error("Failed to finalize tender on smart contract:", err);
            }

            await tx.insert(tenderResults).values({
                id: crypto.randomUUID(),
                tenderId,
                winningBidId: payload.winningBidId!,
                finalScore: (payload.finalScore ?? 0).toString(),
                decidedBy: userId,
                decidedAt: now,
                blockchainTxHash: txHash,
                createdAt: now,
            });

            // C. Blockchain Transaction Record
            let contractAddress = "0x0000000000000000000000000000000000000000";
            try {
                contractAddress = await contract.getAddress();
            } catch {
                // fallback
            }

            await tx.insert(blockchainTransactions).values({
                id: crypto.randomUUID(),
                tenderId,
                bidId: payload.winningBidId,
                transactionType: "RESULT",
                txHash: txHash,
                chainId: 31337,
                contractAddress,
                blockNumber: 0,
                blockTimestamp: now,
                metadata: {
                    action: "finalize",
                    winningBidId: payload.winningBidId,
                    finalScore: payload.finalScore,
                },
                createdAt: now,
            });

            // D. Update Tender Status
            await tx
                .update(tenders)
                .set({
                    status: "COMPLETED",
                    completedAt: now,
                    updatedAt: now,
                })
                .where(eq(tenders.id, tenderId));
        });

        // E. Send Notifications
        try {
            const bidIds = submittedBids.map((b) => b.bidId);
            if (bidIds.length > 0) {
                const allBids = await db.query.bids.findMany({
                    where: (b, { inArray }) => inArray(b.id, bidIds),
                });
                const orgIds = allBids.map((b) => b.organizationId);

                if (orgIds.length > 0) {
                    const members = await db.query.organizationMembers.findMany({
                        where: (m, { inArray, eq, and }) =>
                            and(inArray(m.organizationId, orgIds), eq(m.status, "ACTIVE")),
                    });

                    const orgToMembers = new Map<string, typeof members>();
                    members.forEach((m) => {
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
                                link: `/tenders/${tenderId}`,
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

    static async resolveTie(tenderId: string, payload: TenderModel.resolveTieInput, userId: string) {
        const tender = await db.query.tenders.findFirst({
            where: (t, { eq }) => eq(t.id, tenderId),
        });
        if (!tender) throw new Error("Tender not found");
        if (tender.status !== "TIED") throw new Error("Tender is not awaiting tie resolution");

        const candidateBidIds = Array.isArray(tender.tieCandidateBidIds)
            ? (tender.tieCandidateBidIds as string[])
            : [];
        if (!candidateBidIds.includes(payload.winningBidId)) {
            throw new Error("Pemenang harus dipilih dari kandidat yang seri.");
        }

        const scores = await db.query.bidScores.findMany({
            where: (score, { inArray }) => inArray(score.bidId, candidateBidIds),
        });
        const winnerScore = scores
            .filter((score) => score.bidId === payload.winningBidId)
            .reduce((total, score) => total + Number(score.weightedScore), 0);
        if (scores.length === 0) throw new Error("Data skor untuk penyelesaian seri tidak ditemukan.");

        const now = new Date();
        const tieBreakEvidenceHash = TenderService.hashEvidence({
            tenderId,
            candidateBidIds: [...candidateBidIds].sort(),
            winningBidId: payload.winningBidId,
            decisionNotes: payload.decisionNotes,
            evaluationHash: tender.tieBreakEvidenceHash,
        });

        let txHash = `0xmocktxhash${crypto.randomUUID().replace(/-/g, "")}`;
        try {
            const transaction = await contract.resolveTie(
                tenderId,
                payload.winningBidId,
                winnerScore.toFixed(2),
                tieBreakEvidenceHash,
            );
            const receipt = await transaction.wait();
            txHash = receipt.hash;
        } catch (error) {
            console.error("Failed to resolve tie on smart contract:", error);
            throw new Error("Gagal mencatat penyelesaian seri ke Blockchain.");
        }

        await db.transaction(async (tx) => {
            await tx.insert(tenderResults).values({
                id: crypto.randomUUID(),
                tenderId,
                winningBidId: payload.winningBidId,
                finalScore: winnerScore.toFixed(2),
                decisionNotes: payload.decisionNotes,
                decidedBy: userId,
                decidedAt: now,
                blockchainTxHash: txHash,
                createdAt: now,
            });
            await tx.insert(blockchainTransactions).values({
                id: crypto.randomUUID(),
                tenderId,
                bidId: payload.winningBidId,
                transactionType: "RESULT",
                txHash,
                chainId: 31337,
                contractAddress: await contract.getAddress().catch(() => "0x0000000000000000000000000000000000000000"),
                blockNumber: 0,
                blockTimestamp: now,
                metadata: {
                    action: "resolve_tie",
                    candidateBidIds,
                    tieBreakEvidenceHash,
                },
                createdAt: now,
            });
            await tx
                .update(tenders)
                .set({
                    status: "COMPLETED",
                    completedAt: now,
                    tieBreakReason: payload.decisionNotes,
                    tieBreakEvidenceHash,
                    tieResolvedAt: now,
                    tieResolvedBy: userId,
                    updatedAt: now,
                })
                .where(eq(tenders.id, tenderId));
        });

        return { success: true, finalScore: winnerScore, tieBreakEvidenceHash };
    }

    static async getAuditData(tenderId: string) {
        const [tender, result, allTx, allBids] = await Promise.all([
            db.query.tenders.findFirst({
                where: (t, { eq }) => eq(t.id, tenderId),
            }),
            db.query.tenderResults.findFirst({
                where: (tr, { eq }) => eq(tr.tenderId, tenderId),
            }),
            db.query.blockchainTransactions.findMany({
                where: (t, { eq }) => eq(t.tenderId, tenderId),
                orderBy: (t, { desc }) => [desc(t.createdAt)],
            }),
            db.query.bids.findMany({
                where: (b, { eq }) => eq(b.tenderId, tenderId),
                with: {
                    organization: true,
                    reveal: true,
                },
            }),
        ]);

        if (!tender) {
            throw new Error("Tender not found");
        }

        if (tender.status !== "COMPLETED" && tender.status !== "CANCELLED") {
            throw new Error("Tender is not completed yet or not found");
        }

        const bidIds = allBids.map((b) => b.id);

        let allScores: any[] = [];
        if (bidIds.length > 0) {
            allScores = await db.query.bidScores.findMany({
                where: (s, { inArray }) => inArray(s.bidId, bidIds),
            });
        }

        const resultTx = allTx.find((t) => t.transactionType === "RESULT") || allTx[0] || null;

        return {
            tender,
            result: result || null,
            transaction: resultTx,
            allTransactions: allTx,
            bids: allBids,
            scores: allScores,
        };
    }
}
