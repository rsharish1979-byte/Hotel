import React, { useEffect, useMemo, useState } from 'react';

// Mock seed data for the prototype.
const initialHotels = [
  {
    id: 1,
    name: 'SS Hyderabad Briyani',
    distance: '1.2 km',
    location: 'Gandhipuram',
    dishes: [
      {
        id: 101,
        name: 'Chicken Briyani',
        price: 180,
        isAvailable: true,
        lastUpdated: '10 mins ago',
      },
      {
        id: 102,
        name: 'Mutton Briyani',
        price: 260,
        isAvailable: false,
        lastUpdated: '1 hour ago',
      },
    ],
  },
  {
    id: 2,
    name: 'Annapoorna Hotel',
    distance: '2.5 km',
    location: 'RS Puram',
    dishes: [
      {
        id: 201,
        name: 'Veg Meals',
        price: 120,
        isAvailable: true,
        lastUpdated: '5 mins ago',
      },
      {
        id: 202,
        name: 'Parotta',
        price: 15,
        isAvailable: true,
        lastUpdated: '15 mins ago',
      },
    ],
  },
];

function App() {
  // Single source of truth so owner changes reflect everywhere.
  const [hotels, setHotels] = useState(initialHotels);
  const [currentView, setCurrentView] = useState('home');
  const [searchText, setSearchText] = useState('');
  const [selectedHotelId, setSelectedHotelId] = useState(initialHotels[0].id);

  const selectedHotel = useMemo(
    () => hotels.find((hotel) => hotel.id === selectedHotelId),
    [hotels, selectedHotelId]
  );

  // Flatten available dishes for home page, filtered by dish name only.
  const visibleHomeDishes = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return hotels.flatMap((hotel) =>
      hotel.dishes
        .filter((dish) => dish.isAvailable)
        .filter((dish) => dish.name.toLowerCase().includes(query))
        .map((dish) => ({
          ...dish,
          hotelName: hotel.name,
          distance: hotel.distance,
          hotelId: hotel.id,
        }))
    );
  }, [hotels, searchText]);

  // Keep selected hotel valid if data changes.
  useEffect(() => {
    if (!hotels.some((hotel) => hotel.id === selectedHotelId) && hotels.length > 0) {
      setSelectedHotelId(hotels[0].id);
    }
  }, [hotels, selectedHotelId]);

  // Owner dashboard toggle handler.
  const toggleDishAvailability = (hotelId, dishId) => {
    setHotels((prevHotels) =>
      prevHotels.map((hotel) => {
        if (hotel.id !== hotelId) return hotel;

        return {
          ...hotel,
          dishes: hotel.dishes.map((dish) => {
            if (dish.id !== dishId) return dish;

            const now = new Date();
            const updatedTime = now.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return {
              ...dish,
              isAvailable: !dish.isAvailable,
              lastUpdated: `Updated at ${updatedTime}`,
            };
          }),
        };
      })
    );
  };

  return (
    <div style={styles.appWrapper}>
      <header style={styles.topBar}>
        <h1 style={styles.title}>Live Menu Near You</h1>
        <nav style={styles.navButtons}>
          <button style={buttonStyle(currentView === 'home')} onClick={() => setCurrentView('home')}>
            Home
          </button>
          <button
            style={buttonStyle(currentView === 'hotel')}
            onClick={() => setCurrentView('hotel')}
          >
            Hotel Detail
          </button>
          <button
            style={buttonStyle(currentView === 'owner')}
            onClick={() => setCurrentView('owner')}
          >
            Owner Dashboard
          </button>
        </nav>
      </header>

      <main style={styles.mainArea}>
        {(currentView === 'hotel' || currentView === 'owner') && (
          <div style={styles.selectorRow}>
            <label htmlFor="hotel-select" style={styles.selectorLabel}>
              Select Hotel:
            </label>
            <select
              id="hotel-select"
              style={styles.select}
              value={selectedHotelId}
              onChange={(e) => setSelectedHotelId(Number(e.target.value))}
            >
              {hotels.map((hotel) => (
                <option key={hotel.id} value={hotel.id}>
                  {hotel.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {currentView === 'home' && (
          <section>
            <div style={styles.searchWrap}>
              <input
                type="text"
                placeholder="Search available dishes..."
                style={styles.searchInput}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            {visibleHomeDishes.length === 0 ? (
              <p style={styles.emptyState}>No dishes available right now.</p>
            ) : (
              <div style={styles.cardGrid}>
                {visibleHomeDishes.map((dish) => (
                  <article key={`${dish.hotelId}-${dish.id}`} style={styles.card}>
                    <h3 style={styles.cardTitle}>{dish.name}</h3>
                    <p style={styles.cardLine}>Hotel: {dish.hotelName}</p>
                    <p style={styles.cardLine}>Price: ₹{dish.price}</p>
                    <p style={styles.cardLine}>Distance: {dish.distance}</p>
                    <p style={styles.cardLine}>
                      Status:{' '}
                      <span style={styles.availableBadge}>Available</span>
                    </p>
                    <p style={styles.cardLine}>Last Updated: {dish.lastUpdated}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {currentView === 'hotel' && selectedHotel && (
          <section style={styles.panel}>
            <h2 style={styles.sectionTitle}>{selectedHotel.name}</h2>
            <p style={styles.sectionSub}>Location: {selectedHotel.location}</p>
            {selectedHotel.dishes.map((dish) => (
              <div key={dish.id} style={styles.listRow}>
                <div>
                  <strong>{dish.name}</strong>
                  <p style={styles.metaText}>Last Updated: {dish.lastUpdated}</p>
                </div>
                <div style={styles.rowRight}>
                  <span>₹{dish.price}</span>
                  <span style={dish.isAvailable ? styles.okText : styles.soldOutText}>
                    {dish.isAvailable ? 'Available' : 'Sold Out'}
                  </span>
                </div>
              </div>
            ))}
          </section>
        )}

        {currentView === 'owner' && selectedHotel && (
          <section style={styles.panel}>
            <h2 style={styles.sectionTitle}>Owner Dashboard</h2>
            <p style={styles.sectionSub}>{selectedHotel.name}</p>
            {selectedHotel.dishes.map((dish) => (
              <div key={dish.id} style={styles.listRow}>
                <div>
                  <strong>{dish.name}</strong>
                  <p style={styles.metaText}>Last Updated: {dish.lastUpdated}</p>
                </div>
                <div style={styles.rowRight}>
                  <span style={dish.isAvailable ? styles.okText : styles.soldOutText}>
                    {dish.isAvailable ? 'Available' : 'Sold Out'}
                  </span>
                  <button
                    style={styles.toggleBtn}
                    onClick={() => toggleDishAvailability(selectedHotel.id, dish.id)}
                  >
                    Set {dish.isAvailable ? 'Sold Out' : 'Available'}
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

const buttonStyle = (isActive) => ({
  ...styles.navButton,
  ...(isActive ? styles.navButtonActive : {}),
});

const styles = {
  appWrapper: {
    minHeight: '100vh',
    background: '#f3f4f6',
    color: '#111827',
    fontFamily: 'Arial, sans-serif',
  },
  topBar: {
    background: '#111827',
    color: '#fff',
    padding: '16px 20px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { margin: 0, fontSize: 24 },
  navButtons: { display: 'flex', gap: 8 },
  navButton: {
    background: 'transparent',
    color: '#fff',
    border: '1px solid #6b7280',
    borderRadius: 8,
    padding: '8px 12px',
    cursor: 'pointer',
  },
  navButtonActive: {
    background: '#2563eb',
    borderColor: '#2563eb',
  },
  mainArea: {
    maxWidth: 1000,
    margin: '0 auto',
    padding: 20,
  },
  selectorRow: {
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  selectorLabel: { fontWeight: 600 },
  select: {
    padding: '8px 10px',
    borderRadius: 8,
    border: '1px solid #cbd5e1',
  },
  searchWrap: { marginBottom: 16 },
  searchInput: {
    width: '100%',
    maxWidth: 420,
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #cbd5e1',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 12,
  },
  card: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: 14,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  cardTitle: { margin: '0 0 8px', fontSize: 18 },
  cardLine: { margin: '4px 0', fontSize: 14 },
  availableBadge: {
    background: '#dcfce7',
    color: '#166534',
    borderRadius: 999,
    padding: '2px 8px',
    fontWeight: 700,
    fontSize: 12,
  },
  panel: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid #e5e7eb',
    padding: 16,
  },
  sectionTitle: { marginTop: 0 },
  sectionSub: { marginTop: -4, color: '#4b5563' },
  listRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #f1f5f9',
    padding: '12px 0',
    gap: 10,
  },
  rowRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  metaText: {
    margin: '4px 0 0',
    color: '#6b7280',
    fontSize: 13,
  },
  okText: { color: '#15803d', fontWeight: 700 },
  soldOutText: { color: '#b91c1c', fontWeight: 700 },
  toggleBtn: {
    border: 'none',
    borderRadius: 8,
    padding: '7px 10px',
    background: '#1d4ed8',
    color: '#fff',
    cursor: 'pointer',
  },
  emptyState: {
    marginTop: 20,
    color: '#4b5563',
    fontWeight: 600,
  },
};

export default App;
