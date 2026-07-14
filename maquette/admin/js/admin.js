/* ========================================================================= */
/* ADMIN PANEL — Component Loader + Alpine State                             */
/* ========================================================================= */

(async function loadAdminComponents() {
    var els = document.querySelectorAll('[data-include]');
    var seen = new Set();
    var fetches = [];
    els.forEach(function (el) {
        var name = el.getAttribute('data-include');
        if (seen.has(name)) return;
        seen.add(name);
        fetches.push(
            fetch('components/' + name + '.html')
                .then(function (r) { if (!r.ok) throw new Error(name); return r.text(); })
                .then(function (html) {
                    document.querySelectorAll('[data-include="' + name + '"]').forEach(function (ph) {
                        ph.innerHTML = html;
                    });
                })
        );
    });
    await Promise.all(fetches);
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js';
    document.head.appendChild(s);
})();

/* ── Dashboard app ────────────────────────────────────────────────────── */
function adminApp() {
    return {}
}

/* ── Users management ─────────────────────────────────────────────────── */
function adminUsers() {
    return {
        search: '',
        users: [
            { id: 1, name: 'Salma Alami',   email: 'salma@email.com',    role: 'admin',        date: '12 Jan. 2026',  reservations: 3,  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80' },
            { id: 2, name: 'Youssef Benani', email: 'youssef@email.com',  role: 'proprietaire', date: '3 Fév. 2026',   reservations: 12, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' },
            { id: 3, name: 'Amina Tazi',     email: 'amina@email.com',    role: 'voyageur',     date: '18 Mar. 2026',  reservations: 5,  avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80' },
            { id: 4, name: 'Omar Fassi',     email: 'omar@email.com',     role: 'proprietaire', date: '2 Avr. 2026',   reservations: 8,  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80' },
            { id: 5, name: 'Fatima Zahra',   email: 'fatima@email.com',   role: 'voyageur',     date: '10 Mai. 2026',  reservations: 2,  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80' },
            { id: 6, name: 'Karim Idrissi',  email: 'karim@email.com',    role: 'voyageur',     date: '22 Mai. 2026',  reservations: 1,  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80' },
            { id: 7, name: 'Nadia Berrada',  email: 'nadia@email.com',    role: 'proprietaire', date: '1 Juin. 2026',  reservations: 15, avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80' },
        ],
        filteredUsers: function () {
            var self = this;
            if (!self.search) return self.users;
            var q = self.search.toLowerCase();
            return self.users.filter(function (u) {
                return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
            });
        },
        deleteUser: function (id) {
            if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
                this.users = this.users.filter(function (u) { return u.id !== id; });
            }
        }
    }
}
