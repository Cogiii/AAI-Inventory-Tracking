const { emitRealtimeEvent, emitToProject } = require('./index');

/**
 * Create a standardized event payload
 * @param {string} type - Event type: 'created' | 'updated' | 'deleted'
 * @param {string} entity - Entity type
 * @param {Object} options - Additional options
 * @returns {Object} Event payload
 */
const createEvent = (type, entity, options = {}) => ({
  type,
  entity,
  id: options.id,
  data: options.data,
  metadata: {
    triggeredBy: options.userId,
    triggeredByName: options.userName || 'System',
    timestamp: new Date().toISOString(),
    joNumber: options.joNumber,
  },
});

// ============================================
// INVENTORY EVENTS
// ============================================

/**
 * Emit event when inventory item is created
 */
const emitInventoryCreated = (id, data, user) => {
  emitRealtimeEvent(createEvent('created', 'inventory', {
    id,
    data,
    userId: user?.id,
    userName: user?.name,
  }));
  // Also update dashboard since inventory affects stats
  emitRealtimeEvent(createEvent('updated', 'dashboard', {
    userId: user?.id,
    userName: user?.name,
  }));
};

/**
 * Emit event when inventory item is updated
 */
const emitInventoryUpdated = (id, data, user) => {
  emitRealtimeEvent(createEvent('updated', 'inventory', {
    id,
    data,
    userId: user?.id,
    userName: user?.name,
  }));
  // Also update dashboard since inventory affects stats
  emitRealtimeEvent(createEvent('updated', 'dashboard', {
    userId: user?.id,
    userName: user?.name,
  }));
};

/**
 * Emit event when inventory item is deleted
 */
const emitInventoryDeleted = (id, user) => {
  emitRealtimeEvent(createEvent('deleted', 'inventory', {
    id,
    userId: user?.id,
    userName: user?.name,
  }));
  // Also update dashboard since inventory affects stats
  emitRealtimeEvent(createEvent('updated', 'dashboard', {
    userId: user?.id,
    userName: user?.name,
  }));
};

/**
 * Emit event when stock is added to inventory
 */
const emitStockAdded = (id, data, user) => {
  emitRealtimeEvent(createEvent('updated', 'inventory', {
    id,
    data,
    userId: user?.id,
    userName: user?.name,
  }));
  emitRealtimeEvent(createEvent('updated', 'dashboard', {
    userId: user?.id,
    userName: user?.name,
  }));
};

/**
 * Emit event when stock is removed from inventory
 */
const emitStockRemoved = (id, data, user) => {
  emitRealtimeEvent(createEvent('updated', 'inventory', {
    id,
    data,
    userId: user?.id,
    userName: user?.name,
  }));
  emitRealtimeEvent(createEvent('updated', 'dashboard', {
    userId: user?.id,
    userName: user?.name,
  }));
};

// ============================================
// PROJECT EVENTS
// ============================================

/**
 * Emit event when project is created
 */
const emitProjectCreated = (id, data, user) => {
  emitRealtimeEvent(createEvent('created', 'project', {
    id,
    data,
    userId: user?.id,
    userName: user?.name,
  }));
  emitRealtimeEvent(createEvent('updated', 'dashboard', {
    userId: user?.id,
    userName: user?.name,
  }));
  emitRealtimeEvent(createEvent('updated', 'calendar', {
    userId: user?.id,
    userName: user?.name,
  }));
};

/**
 * Emit event when project is updated
 */
const emitProjectUpdated = (id, data, user, joNumber) => {
  emitRealtimeEvent(createEvent('updated', 'project', {
    id,
    data,
    userId: user?.id,
    userName: user?.name,
    joNumber,
  }));
  // Also emit to project room for project detail page
  if (joNumber) {
    emitToProject(joNumber, createEvent('updated', 'project-detail', {
      id,
      data,
      userId: user?.id,
      userName: user?.name,
      joNumber,
    }));
  }
  emitRealtimeEvent(createEvent('updated', 'dashboard', {
    userId: user?.id,
    userName: user?.name,
  }));
  emitRealtimeEvent(createEvent('updated', 'calendar', {
    userId: user?.id,
    userName: user?.name,
  }));
};

/**
 * Emit event when project is deleted
 */
const emitProjectDeleted = (id, user, joNumber) => {
  emitRealtimeEvent(createEvent('deleted', 'project', {
    id,
    userId: user?.id,
    userName: user?.name,
    joNumber,
  }));
  emitRealtimeEvent(createEvent('updated', 'dashboard', {
    userId: user?.id,
    userName: user?.name,
  }));
  emitRealtimeEvent(createEvent('updated', 'calendar', {
    userId: user?.id,
    userName: user?.name,
  }));
};

// ============================================
// PROJECT DETAIL EVENTS (Personnel, Items, Days)
// ============================================

/**
 * Emit event when project detail is updated (personnel, items, days)
 */
const emitProjectDetailUpdated = (joNumber, data, user) => {
  if (joNumber) {
    emitToProject(joNumber, createEvent('updated', 'project-detail', {
      data,
      userId: user?.id,
      userName: user?.name,
      joNumber,
    }));
  }
  // Also broadcast general project update
  emitRealtimeEvent(createEvent('updated', 'project', {
    userId: user?.id,
    userName: user?.name,
    joNumber,
  }));
  // Update inventory if items were affected
  emitRealtimeEvent(createEvent('updated', 'inventory', {
    userId: user?.id,
    userName: user?.name,
  }));
};

/**
 * Emit event when project day is added
 */
const emitProjectDayAdded = (joNumber, data, user) => {
  if (joNumber) {
    emitToProject(joNumber, createEvent('created', 'project-detail', {
      data,
      userId: user?.id,
      userName: user?.name,
      joNumber,
    }));
  }
  emitRealtimeEvent(createEvent('updated', 'calendar', {
    userId: user?.id,
    userName: user?.name,
  }));
};

/**
 * Emit event when project day is updated
 */
const emitProjectDayUpdated = (joNumber, data, user) => {
  if (joNumber) {
    emitToProject(joNumber, createEvent('updated', 'project-detail', {
      data,
      userId: user?.id,
      userName: user?.name,
      joNumber,
    }));
  }
  emitRealtimeEvent(createEvent('updated', 'calendar', {
    userId: user?.id,
    userName: user?.name,
  }));
};

/**
 * Emit event when project day is deleted
 */
const emitProjectDayDeleted = (joNumber, dayId, user) => {
  if (joNumber) {
    emitToProject(joNumber, createEvent('deleted', 'project-detail', {
      id: dayId,
      userId: user?.id,
      userName: user?.name,
      joNumber,
    }));
  }
  emitRealtimeEvent(createEvent('updated', 'calendar', {
    userId: user?.id,
    userName: user?.name,
  }));
};

// ============================================
// USER EVENTS
// ============================================

/**
 * Emit event when user is created
 */
const emitUserCreated = (id, data, user) => {
  emitRealtimeEvent(createEvent('created', 'user', {
    id,
    data,
    userId: user?.id,
    userName: user?.name,
  }));
};

/**
 * Emit event when user is updated
 */
const emitUserUpdated = (id, data, user) => {
  emitRealtimeEvent(createEvent('updated', 'user', {
    id,
    data,
    userId: user?.id,
    userName: user?.name,
  }));
};

/**
 * Emit event when user is deleted
 */
const emitUserDeleted = (id, user) => {
  emitRealtimeEvent(createEvent('deleted', 'user', {
    id,
    userId: user?.id,
    userName: user?.name,
  }));
};

// ============================================
// LOCATION & BRAND EVENTS
// ============================================

/**
 * Emit event when location is created
 */
const emitLocationCreated = (id, data, user) => {
  emitRealtimeEvent(createEvent('created', 'location', {
    id,
    data,
    userId: user?.id,
    userName: user?.name,
  }));
};

/**
 * Emit event when location is updated
 */
const emitLocationUpdated = (id, data, user) => {
  emitRealtimeEvent(createEvent('updated', 'location', {
    id,
    data,
    userId: user?.id,
    userName: user?.name,
  }));
};

/**
 * Emit event when location is deleted
 */
const emitLocationDeleted = (id, user) => {
  emitRealtimeEvent(createEvent('deleted', 'location', {
    id,
    userId: user?.id,
    userName: user?.name,
  }));
};

/**
 * Emit event when brand is created
 */
const emitBrandCreated = (id, data, user) => {
  emitRealtimeEvent(createEvent('created', 'brand', {
    id,
    data,
    userId: user?.id,
    userName: user?.name,
  }));
};

module.exports = {
  // Inventory
  emitInventoryCreated,
  emitInventoryUpdated,
  emitInventoryDeleted,
  emitStockAdded,
  emitStockRemoved,
  // Projects
  emitProjectCreated,
  emitProjectUpdated,
  emitProjectDeleted,
  // Project Detail
  emitProjectDetailUpdated,
  emitProjectDayAdded,
  emitProjectDayUpdated,
  emitProjectDayDeleted,
  // Users
  emitUserCreated,
  emitUserUpdated,
  emitUserDeleted,
  // Locations & Brands
  emitLocationCreated,
  emitLocationUpdated,
  emitLocationDeleted,
  emitBrandCreated,
};
