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
var _defaultProperties = [
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

if (!localStorage.getItem('stayflow_properties')) {
    localStorage.setItem('stayflow_properties', JSON.stringify(_defaultProperties));
}

var _sharedProperties = JSON.parse(localStorage.getItem('stayflow_properties'));

function savePropertiesToStorage(props) {
    localStorage.setItem('stayflow_properties', JSON.stringify(props));
}

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
        
        // Search & Filters state
        searchQuery: '',
        selectedCategory: '',
        selectedStatus: '',
        
        // Pagination state
        currentPage: 1,
        itemsPerPage: 3,

        // Custom confirm dialog state
        confirmOpen: false,
        confirmTitle: '',
        confirmMessage: '',
        confirmAction: null,

        // Toast notifications state
        toasts: [],
        showToast: function (message, type = 'success') {
            var id = Date.now();
            this.toasts.push({ id: id, message: message, type: type, visible: true });
            var self = this;
            setTimeout(function() {
                var toast = self.toasts.find(function(t) { return t.id === id; });
                if (toast) toast.visible = false;
            }, 3000);
        },
        
        // Getters/Methods for filters
        get filteredProperties() {
            var q = this.searchQuery.toLowerCase().trim();
            var cat = this.selectedCategory;
            var stat = this.selectedStatus;
            
            return this.properties.filter(function (p) {
                // Search query filter
                if (q && !p.title.toLowerCase().includes(q) && !p.location.toLowerCase().includes(q)) {
                    return false;
                }
                // Category filter
                if (cat && p.category !== cat) {
                    return false;
                }
                // Status filter
                if (stat !== '') {
                    var isDisp = stat === 'disponible';
                    if (p.disponible !== isDisp) {
                        return false;
                    }
                }
                return true;
            });
        },
        
        // Getters/Methods for pagination
        get totalPages() {
            return Math.ceil(this.filteredProperties.length / this.itemsPerPage) || 1;
        },
        
        get paginatedProperties() {
            // Adjust current page if it exceeds total pages due to filtering
            if (this.currentPage > this.totalPages) {
                this.currentPage = this.totalPages;
            }
            var start = (this.currentPage - 1) * this.itemsPerPage;
            return this.filteredProperties.slice(start, start + this.itemsPerPage);
        },
        
        prevPage: function () {
            if (this.currentPage > 1) this.currentPage--;
        },
        
        nextPage: function () {
            if (this.currentPage < this.totalPages) this.currentPage++;
        },
        
        goToPage: function (page) {
            this.currentPage = page;
        },
        
        // Availability toggle
        toggleAvailability: function (p) {
            p.disponible = !p.disponible;
            savePropertiesToStorage(this.properties);
            this.showToast(
                p.title + ' est maintenant ' + (p.disponible ? 'disponible' : 'indisponible') + '.',
                p.disponible ? 'success' : 'info'
            );
        },
        
        // Delete property
        deleteProperty: function (id) {
            var self = this;
            this.confirmTitle = 'Supprimer la maison ?';
            this.confirmMessage = 'Cette action est définitive. Êtes-vous sûr de vouloir retirer cette annonce de StayFlow ?';
            this.confirmAction = function () {
                _sharedProperties = _sharedProperties.filter(function (p) { return p.id !== id; });
                self.properties = _sharedProperties;
                savePropertiesToStorage(_sharedProperties);
                if (self.currentPage > self.totalPages) {
                    self.currentPage = self.totalPages;
                }
                self.showToast('Maison supprimée avec succès !', 'success');
            };
            this.confirmOpen = true;
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
            images: []
        },
        handleFiles: function (files) {
            var self = this;
            Array.from(files).forEach(function (file) {
                if (!file.type.startsWith('image/')) return;
                var reader = new FileReader();
                reader.onload = function (e) {
                    self.form.images.push(e.target.result);
                };
                reader.readAsDataURL(file);
            });
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
                id: Date.now(),
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
            savePropertiesToStorage(_sharedProperties);
            this.saved = true;
        }
    }
}

/* ── Edit house page ─────────────────────────────────────────────────── */
function proprioEdit() {
    var urlParams = new URLSearchParams(window.location.search);
    var id = Number(urlParams.get('id'));
    var originalProp = _sharedProperties.find(function (p) { return p.id === id; });
    
    if (!originalProp) {
        setTimeout(function() {
            alert('Propriété introuvable.');
            window.location.href = 'mes-maisons.html';
        }, 100);
        return {
            saved: false,
            form: { title: '', location: '', price: '', category: 'pools', disponible: true, images: [] }
        };
    }
    
    return {
        saved: false,
        form: JSON.parse(JSON.stringify(originalProp)),
        
        handleFiles: function (files) {
            var self = this;
            Array.from(files).forEach(function (file) {
                if (!file.type.startsWith('image/')) return;
                var reader = new FileReader();
                reader.onload = function (e) {
                    self.form.images.push(e.target.result);
                };
                reader.readAsDataURL(file);
            });
        },
        
        removeImage: function (idx) {
            this.form.images.splice(idx, 1);
        },
        
        updateProperty: function () {
            if (!this.form.title.trim() || !this.form.location.trim()) {
                alert('Veuillez remplir le titre et la localisation.');
                return;
            }
            if (this.form.images.length === 0) {
                alert('Veuillez ajouter au moins une photo.');
                return;
            }
            
            var self = this;
            _sharedProperties = _sharedProperties.map(function (p) {
                if (p.id === self.form.id) {
                    return {
                        id: p.id,
                        title: self.form.title,
                        location: self.form.location,
                        price: Number(self.form.price),
                        rating: p.rating,
                        category: self.form.category,
                        images: self.form.images,
                        description: self.form.description,
                        favorited: p.favorited,
                        disponible: self.form.disponible,
                        chambres: Number(self.form.chambres),
                        superficie: Number(self.form.superficie),
                        capacite: Number(self.form.capacite)
                    };
                }
                return p;
            });
            
            savePropertiesToStorage(_sharedProperties);
            this.saved = true;
        }
    }
}
