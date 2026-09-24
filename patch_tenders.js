const fs = require('fs');
let content = fs.readFileSync('src/app/tenders/create/page.tsx', 'utf8');

// Replace the reveal window input
content = content.replace(
    /<input type="number" min=\{1\} max=\{720\} value=\{form.revealWindowHours\}.*?\/>/s,
    `
    <div className="flex items-center gap-2">
        <input 
            type="number" 
            min={0} 
            max={30} 
            placeholder="Hari"
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-transparent text-sm"
            value={Math.floor(form.revealWindowHours / 24)} 
            onChange={(e) => {
                const days = Number(e.target.value) || 0;
                const hours = Math.floor(form.revealWindowHours % 24);
                const minutes = Math.round((form.revealWindowHours % 1) * 60);
                setForm(p => ({ ...p, revealWindowHours: (days * 24) + hours + (minutes / 60) }));
            }} 
        />
        <span className="text-xs text-[var(--text-tertiary)]">Hari</span>
        
        <input 
            type="number" 
            min={0} 
            max={23} 
            placeholder="Jam"
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-transparent text-sm"
            value={Math.floor(form.revealWindowHours % 24)} 
            onChange={(e) => {
                const days = Math.floor(form.revealWindowHours / 24);
                const hours = Number(e.target.value) || 0;
                const minutes = Math.round((form.revealWindowHours % 1) * 60);
                setForm(p => ({ ...p, revealWindowHours: (days * 24) + hours + (minutes / 60) }));
            }} 
        />
        <span className="text-xs text-[var(--text-tertiary)]">Jam</span>
        
        <input 
            type="number" 
            min={0} 
            max={59} 
            placeholder="Menit"
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-transparent text-sm"
            value={Math.round((form.revealWindowHours % 1) * 60)} 
            onChange={(e) => {
                const days = Math.floor(form.revealWindowHours / 24);
                const hours = Math.floor(form.revealWindowHours % 24);
                const minutes = Number(e.target.value) || 0;
                setForm(p => ({ ...p, revealWindowHours: (days * 24) + hours + (minutes / 60) }));
            }} 
        />
        <span className="text-xs text-[var(--text-tertiary)]">Menit</span>
    </div>
    `
);

// Format the display in review page
content = content.replace(
    /<ReviewRow label="Reveal Window" value=\{`\$\{form.revealWindowHours\} jam`\} \/>/g,
    `
    <ReviewRow label="Reveal Window" value={\`\${Math.floor(form.revealWindowHours / 24) > 0 ? Math.floor(form.revealWindowHours / 24) + " Hari " : ""}\${Math.floor(form.revealWindowHours % 24) > 0 ? Math.floor(form.revealWindowHours % 24) + " Jam " : ""}\${Math.round((form.revealWindowHours % 1) * 60) > 0 ? Math.round((form.revealWindowHours % 1) * 60) + " Menit" : ""}\`} />
    `
);

fs.writeFileSync('src/app/tenders/create/page.tsx', content);
