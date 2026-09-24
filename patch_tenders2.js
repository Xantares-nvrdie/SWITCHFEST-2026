const fs = require('fs');
let content = fs.readFileSync('src/app/tenders/[id]/page.tsx', 'utf8');

// Format the display in tender details page
content = content.replace(
    /\{tender.revealWindowHours\} jam/g,
    `{Math.floor(tender.revealWindowHours / 24) > 0 ? Math.floor(tender.revealWindowHours / 24) + " hari " : ""}{Math.floor(tender.revealWindowHours % 24) > 0 ? Math.floor(tender.revealWindowHours % 24) + " jam " : ""}{Math.round((tender.revealWindowHours % 1) * 60) > 0 ? Math.round((tender.revealWindowHours % 1) * 60) + " menit" : ""}`
);

fs.writeFileSync('src/app/tenders/[id]/page.tsx', content);
