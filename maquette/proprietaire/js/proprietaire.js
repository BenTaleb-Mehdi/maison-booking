/* ========================================================================= */
/* PROPRIETAIRE PANEL — Component Loader + Alpine State                      */
/* ========================================================================= */

(async function loadProprioComponents() {
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

/* ── Shared property data (simulated backend) ─────────────────────────── */
var _sharedProperties = [
    {
        id: 1, title: 'Sunset Beach Villa', location: 'Tanger, Achakar', price: 280, rating: 4.9, category: 'beachfront',
        images: [
            'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'Une villa moderne sur le sable d\'Achakar.', favorited: false, disponible: true, chambres: 4, superficie: 180, capacite: 8
    },
    {
        id: 2, title: 'Modern Oasis Villa', location: 'Marrakech, Palmeraie', price: 350, rating: 4.8, category: 'pools',
        images: [
            'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'Propriété de luxe avec piscine à débordement.', favorited: true, disponible: true, chambres: 5, superficie: 250, capacite: 10
    },
    {
        id: 3, title: 'Cabane Suspendue Atlas', location: 'Chefchaouen, Montagnes', price: 110, rating: 4.7, category: 'cabins',
        images: [
            'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'Cabane écologique au cœur du Rif.', favorited: false, disponible: false, chambres: 2, superficie: 60, capacite: 4
    },
    {
        id: 4, title: 'L\'Horizon Blue Palm', location: 'Dakhla, Lagune', price: 190, rating: 5.0, category: 'beachfront',
        images: [
            'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'Paradis des kitesurfeurs sur la lagune de Dakhla.', favorited: false, disponible: true, chambres: 3, superficie: 120, capacite: 6
    }
];

/* ── Dashboard app ────────────────────────────────────────────────────── */
function proprioApp() {
    return {
        properties: _sharedProperties
    }
}

/* ── Manage houses ────────────────────────────────────────────────────── */
function proprioManage() {
    return {
        properties: _sharedProperties,
        toggleAvailability: function (p) {
            p.disponible = !p.disponible;
        },
        deleteProperty: function (id) {
            if (confirm('Supprimer cette propriété ?')) {
                this.properties = this.properties.filter(function (p) { return p.id !== id; });
            }
        }
    }
}

/* ── Add house form ───────────────────────────────────────────────────── */
function proprioAdd() {
    return {
        saved: false,
        form: {
            title: '',
            location: '',
            price: '',
            chambres: '',
            capacite: '',
            superficie: '',
            category: 'pools',
            description: '',
            images: ['']
        },
        addImageField: function () {
            if (this.form.images.length < 10) this.form.images.push('');
        },
        removeImage: function (idx) {
            this.form.images.splice(idx, 1);
        },
        addProperty: function () {
            var imgs = this.form.images.filter(function (i) { return i.trim(); });
            if (imgs.length === 0) {
                alert('Ajoutez au moins une photo.');
                return;
            }
            var fallbackImg = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80';
            _sharedProperties.unshift({
                id: _sharedProperties.length + 1,
                title: this.form.title,
                location: this.form.location,
                price: Number(this.form.price),
                rating: 5.0,
                category: this.form.category,
                images: imgs.length ? imgs : [fallbackImg],
                description: this.form.description,
                favorited: false,
                disponible: true,
                chambres: Number(this.form.chambres),
                superficie: Number(this.form.superficie),
                capacite: Number(this.form.capacite)
            });
            this.saved = true;
        }
    }
}
