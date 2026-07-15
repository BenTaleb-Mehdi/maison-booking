/* ========================================================================= */
/* COMPONENT LOADER                                                          */
/* ========================================================================= */

(async function loadComponents() {
    var placeholders = document.querySelectorAll('[data-include]');
    var seen = new Set();
    var fetches = [];

    placeholders.forEach(function (el) {
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

/* ========================================================================= */
/* ALPINE.JS APP STATE                                                       */
/* ========================================================================= */

function app() {
    return {
        profileOpen: false,
        detailModalOpen: false,
        selectedProperty: null,
        activeImageIndex: 0,

        toastShow: false,
        toastMessage: '',

        activeTab: 'all',
        searchCity: '',
        searchMaxPrice: 500,

        /* ── Properties (multi-image) ──────────────────────────────────── */
        properties: [
            {
                id: 1,
                title: 'Sunset Beach Villa',
                location: 'Tanger, Achakar',
                price: 280,
                rating: 4.9,
                category: 'beachfront',
                images: [
                    'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
                ],
                description: 'Une villa moderne située directement sur le sable d\'Achakar. Idéal pour des couchers de soleil à couper le souffle, avec terrasse de 150m².',
                favorited: false,
                disponible: true,
                chambres: 4,
                superficie: 180,
                capacite: 8
            },
            {
                id: 2,
                title: 'Modern Oasis Villa',
                location: 'Marrakech, Palmeraie',
                price: 350,
                rating: 4.8,
                category: 'pools',
                images: [
                    'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80'
                ],
                description: 'Propriété de luxe avec piscine à débordement géante, jardins soignés et services hôteliers exclusifs inclus.',
                favorited: true,
                disponible: true,
                chambres: 5,
                superficie: 250,
                capacite: 10
            },
            {
                id: 3,
                title: 'Cabane Suspendue Atlas',
                location: 'Chefchaouen, Montagnes',
                price: 110,
                rating: 4.7,
                category: 'cabins',
                images: [
                    'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1520986606214-8b456906c813?auto=format&fit=crop&w=800&q=80'
                ],
                description: 'Vivez une immersion unique au cœur du Rif. Cabane écologique tout confort suspendue au-dessus de la vallée.',
                favorited: false,
                disponible: false,
                chambres: 2,
                superficie: 60,
                capacite: 4
            },
            {
                id: 4,
                title: 'L\'Horizon Blue Palm',
                location: 'Dakhla, Lagune',
                price: 190,
                rating: 5.0,
                category: 'beachfront',
                images: [
                    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80'
                ],
                description: 'Un écrin de paradis fait de bois et de verre sur la lagune de Dakhla. Le paradis des kitesurfeurs.',
                favorited: false,
                disponible: true,
                chambres: 3,
                superficie: 120,
                capacite: 6
            }
        ],

        /* ── Methods ────────────────────────────────────────────────────── */

        filteredProperties: function () {
            var self = this;
            return this.properties.filter(function (p) {
                var cat = self.activeTab === 'all' || p.category === self.activeTab;
                var city = self.searchCity === '' || p.location.toLowerCase().includes(self.searchCity.toLowerCase());
                var price = p.price <= self.searchMaxPrice;
                return cat && city && price;
            });
        },

        toggleFavorite: function (p) {
            p.favorited = !p.favorited;
            this.toast(p.favorited ? 'Logement ajouté aux favoris !' : 'Retiré des favoris.');
        },

        openDetails: function (p) {
            this.selectedProperty = p;
            this.activeImageIndex = 0;
            this.detailModalOpen = true;
        },

        nextImage: function () {
            if (!this.selectedProperty) return;
            this.activeImageIndex = (this.activeImageIndex + 1) % this.selectedProperty.images.length;
        },

        prevImage: function () {
            if (!this.selectedProperty) return;
            var len = this.selectedProperty.images.length;
            this.activeImageIndex = (this.activeImageIndex - 1 + len) % len;
        },

        goToImage: function (i) {
            this.activeImageIndex = i;
        },

        toast: function (msg) {
            var self = this;
            this.toastMessage = msg;
            this.toastShow = true;
            setTimeout(function () { self.toastShow = false; }, 3500);
        },

        scrollToSearch: function () {
            document.getElementById('search-section').scrollIntoView({ behavior: 'smooth' });
        },

        scrollToGrid: function () {
            document.getElementById('properties-grid').scrollIntoView({ behavior: 'smooth' });
        }
    }
}
