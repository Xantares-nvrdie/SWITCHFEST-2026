const fs = require('fs');
let content = fs.readFileSync('src/app/tenders/page.tsx', 'utf8');

// Format the display in tender details page
content = content.replace(
    /\{t.revealWindowHours\} jam/g,
    `{Math.floor(t.revealWindowHours / 24) > 0 ? Math.floor(t.revealWindowHours / 24) + " hari " : ""}{Math.floor(t.revealWindowHours % 24) > 0 ? Math.floor(t.revealWindowHours % 24) + " jam " : ""}{Math.round((t.revealWindowHours % 1) * 60) > 0 ? Math.round((t.revealWindowHours % 1) * 60) + " menit" : ""}`
);

fs.writeFileSync('src/app/tenders/page.tsx', content);
