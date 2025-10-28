// Shared project data and utilities

// Location Data (normalized as per database schema)
export const getLocations = () => [
  {
    id: 1,
    name: "Main Warehouse",
    type: "warehouse",
    street: "123 Industrial Avenue",
    barangay: "Bagumbayan",
    city: "Quezon City",
    province: "Metro Manila",
    region: "NCR",
    postal_code: "1100",
    full_address: "Main Warehouse, 123 Industrial Avenue, Bagumbayan, Quezon City, Metro Manila"
  },
  {
    id: 2,
    name: "EDSA Makati Construction Site",
    type: "project_site",
    street: "EDSA Highway Section A",
    barangay: "Poblacion",
    city: "Makati",
    province: "Metro Manila",
    region: "NCR",
    postal_code: "1200",
    full_address: "EDSA Makati Construction Site, EDSA Highway Section A, Poblacion, Makati, Metro Manila"
  },
  {
    id: 3,
    name: "EDSA Ortigas Bridge Site",
    type: "project_site",
    street: "EDSA Bridge Construction Area",
    barangay: "Kapitolyo",
    city: "Pasig",
    province: "Metro Manila",
    region: "NCR",
    postal_code: "1600",
    full_address: "EDSA Ortigas Bridge Site, EDSA Bridge Construction Area, Kapitolyo, Pasig, Metro Manila"
  },
  {
    id: 4,
    name: "EDSA Quezon City Drainage",
    type: "project_site",
    street: "EDSA Quezon Avenue Junction",
    barangay: "South Triangle",
    city: "Quezon City",
    province: "Metro Manila",
    region: "NCR",
    postal_code: "1103",
    full_address: "EDSA Quezon City Drainage, EDSA Quezon Avenue Junction, South Triangle, Quezon City, Metro Manila"
  },
  {
    id: 5,
    name: "EDSA Mandaluyong Traffic Hub",
    type: "project_site",
    street: "EDSA Shaw Boulevard Intersection",
    barangay: "Wack Wack",
    city: "Mandaluyong",
    province: "Metro Manila",
    region: "NCR",
    postal_code: "1550",
    full_address: "EDSA Mandaluyong Traffic Hub, EDSA Shaw Boulevard Intersection, Wack Wack, Mandaluyong, Metro Manila"
  },
  {
    id: 6,
    name: "Cebu Business Park Foundation",
    type: "project_site",
    street: "Archbishop Reyes Avenue",
    barangay: "Lahug",
    city: "Cebu City",
    province: "Cebu",
    region: "Central Visayas",
    postal_code: "6000",
    full_address: "Cebu Business Park Foundation, Archbishop Reyes Avenue, Lahug, Cebu City, Cebu"
  },
  {
    id: 7,
    name: "Cebu Business Park Tower",
    type: "project_site",
    street: "Ayala Center Cebu Complex",
    barangay: "Lahug",
    city: "Cebu City",
    province: "Cebu",
    region: "Central Visayas",
    postal_code: "6000",
    full_address: "Cebu Business Park Tower, Ayala Center Cebu Complex, Lahug, Cebu City, Cebu"
  },
  {
    id: 8,
    name: "Residential Phase 1 Area A",
    type: "project_site",
    street: "Lot 1-50 Block A",
    barangay: "San Isidro",
    city: "Antipolo",
    province: "Rizal",
    region: "CALABARZON",
    postal_code: "1870",
    full_address: "Residential Phase 1 Area A, Lot 1-50 Block A, San Isidro, Antipolo, Rizal"
  },
  {
    id: 9,
    name: "Residential Phase 1 Area B",
    type: "project_site",
    street: "Lot 51-100 Block B",
    barangay: "San Isidro",
    city: "Antipolo",
    province: "Rizal",
    region: "CALABARZON",
    postal_code: "1870",
    full_address: "Residential Phase 1 Area B, Lot 51-100 Block B, San Isidro, Antipolo, Rizal"
  },
  {
    id: 10,
    name: "Residential Phase 2 Housing",
    type: "project_site",
    street: "Lot 101-200 Block C",
    barangay: "San Roque",
    city: "Antipolo",
    province: "Rizal",
    region: "CALABARZON",
    postal_code: "1870",
    full_address: "Residential Phase 2 Housing, Lot 101-200 Block C, San Roque, Antipolo, Rizal"
  },
  {
    id: 11,
    name: "Secondary Warehouse Cebu",
    type: "warehouse",
    street: "789 Logistics Drive",
    barangay: "Mabolo",
    city: "Cebu City",
    province: "Cebu",
    region: "Central Visayas",
    postal_code: "6000",
    full_address: "Secondary Warehouse Cebu, 789 Logistics Drive, Mabolo, Cebu City, Cebu"
  },
  {
    id: 12,
    name: "Main Office Manila",
    type: "office",
    street: "456 Business Center",
    barangay: "Salcedo Village",
    city: "Makati",
    province: "Metro Manila",
    region: "NCR",
    postal_code: "1227",
    full_address: "Main Office Manila, 456 Business Center, Salcedo Village, Makati, Metro Manila"
  }
]

// Project Days Data
export const getProjectDaysByJO = (joNumber: string) => {
  const locations = getLocations()
  const projectDays: Record<string, any[]> = {
    'JO-2024-001': [
      {
        id: 1,
        project_date: '2024-10-01',
        location_id: 2, // EDSA Makati Construction Site
        location: locations.find(l => l.id === 2)?.full_address,
        created_at: '2024-09-25',
        status: 'completed'
      },
      {
        id: 2,
        project_date: '2024-10-15',
        location_id: 3, // EDSA Ortigas Bridge Site
        location: locations.find(l => l.id === 3)?.full_address,
        created_at: '2024-09-25',
        status: 'ongoing'
      },
      {
        id: 3,
        project_date: '2024-11-01',
        location_id: 4, // EDSA Quezon City Drainage
        location: locations.find(l => l.id === 4)?.full_address,
        created_at: '2024-10-20',
        status: 'scheduled'
      },
      {
        id: 4,
        project_date: '2024-11-15',
        location_id: 5, // EDSA Mandaluyong Traffic Hub
        location: locations.find(l => l.id === 5)?.full_address,
        created_at: '2024-10-25',
        status: 'scheduled'
      }
    ],
    'JO-2024-002': [
      {
        id: 5,
        project_date: '2024-11-10',
        location_id: 6, // Cebu Business Park Foundation
        location: locations.find(l => l.id === 6)?.full_address,
        created_at: '2024-10-20',
        status: 'scheduled'
      },
      {
        id: 6,
        project_date: '2024-11-20',
        location_id: 7, // Cebu Business Park Tower
        location: locations.find(l => l.id === 7)?.full_address,
        created_at: '2024-10-20',
        status: 'scheduled'
      }
    ],
    'JO-2024-003': [
      {
        id: 7,
        project_date: '2024-09-01',
        location_id: 8, // Residential Phase 1 Area A
        location: locations.find(l => l.id === 8)?.full_address,
        created_at: '2024-08-15',
        status: 'completed'
      },
      {
        id: 8,
        project_date: '2024-09-15',
        location_id: 9, // Residential Phase 1 Area B
        location: locations.find(l => l.id === 9)?.full_address,
        created_at: '2024-08-15',
        status: 'completed'
      },
      {
        id: 9,
        project_date: '2024-10-01',
        location_id: 10, // Residential Phase 2 Housing
        location: locations.find(l => l.id === 10)?.full_address,
        created_at: '2024-09-20',
        status: 'ongoing'
      }
    ]
  }
  return projectDays[joNumber] || []
}

// Available Items Data
export const getAvailableItems = () => [
  { id: 101, name: 'Steel Beams (I-Shape)', type: 'material', brand: 'Philippine Steel', available: 50 },
  { id: 102, name: 'Concrete Mixer (Heavy Duty)', type: 'product', brand: 'Caterpillar', available: 3 },
  { id: 103, name: 'Excavator (Medium)', type: 'product', brand: 'Komatsu', available: 2 },
  { id: 104, name: 'Reinforcement Steel Bars', type: 'material', brand: 'SteelAsia', available: 200 },
  { id: 105, name: 'Hydraulic Pump', type: 'product', brand: 'Bosch', available: 5 },
  { id: 106, name: 'Tower Crane', type: 'product', brand: 'Liebherr', available: 2 }
]

// Available Personnel Data
export const getAvailablePersonnel = () => [
  { id: 101, name: 'Carlos Rodriguez', contact_number: '+63-917-123-4567', is_active: true },
  { id: 102, name: 'Maria Santos', contact_number: '+63-917-234-5678', is_active: true },
  { id: 103, name: 'Roberto Cruz', contact_number: '+63-917-345-6789', is_active: true },
  { id: 104, name: 'David Kim', contact_number: '+63-917-789-0123', is_active: true },
  { id: 105, name: 'Ana Reyes', contact_number: '+63-917-456-7890', is_active: true },
  { id: 106, name: 'Michael Chen', contact_number: '+63-917-567-8901', is_active: true }
]

// Available Roles Data
export const getAvailableRoles = () => [
  { id: 1, name: 'Project Manager' },
  { id: 2, name: 'Site Engineer' },
  { id: 3, name: 'Construction Foreman' },
  { id: 4, name: 'Safety Officer' },
  { id: 5, name: 'Quality Control Inspector' },
  { id: 6, name: 'Equipment Operator' },
  { id: 7, name: 'Structural Engineer' },
  { id: 8, name: 'Construction Supervisor' }
]