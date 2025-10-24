const { query, queryOne } = require('../config/database');
const { hashPassword } = require('../utils/password');

class UserService {
  // Helper method to transform user data
  static transformUser(user) {
    if (!user) return null;
    // Keep is_active as is from database (no camelCase conversion)
    return user;
  }

  // Transform array of users
  static transformUsers(users) {
    if (!users) return [];
    return users.map(user => this.transformUser(user));
  }

  static async findByEmail(email) {
    try {
      const sql = `
        SELECT u.id, u.first_name, u.last_name, u.email, 
               COALESCE(p.name, 'No Position') as role, 
               u.username, u.password_hash as password, u.is_active, 
               u.created_at, u.updated_at
        FROM user u
        LEFT JOIN position p ON u.position_id = p.id
        WHERE u.email = ? 
        LIMIT 1
      `;
      const user = await queryOne(sql, [email]);

      return this.transformUser(user);
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const sql = `
        SELECT u.id, u.first_name, u.last_name, u.email, 
               COALESCE(p.name, 'No Position') as role, 
               u.username, u.is_active, u.created_at, u.updated_at
        FROM user u
        LEFT JOIN position p ON u.position_id = p.id
        WHERE u.id = ? 
        LIMIT 1
      `;
      const user = await queryOne(sql, [id]);

      return this.transformUser(user);
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  static async findByUsername(username) {
    try {
      const sql = `
        SELECT u.id, u.first_name, u.last_name, u.email, 
               COALESCE(p.name, 'No Position') as role, 
               u.username, u.password_hash as password, u.is_active, 
               u.created_at, u.updated_at
        FROM user u
        LEFT JOIN position p ON u.position_id = p.id
        WHERE u.username = ? 
        LIMIT 1
      `;
      const user = await queryOne(sql, [username]);

      return this.transformUser(user);
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }

  static async create(userData) {
    try {
      const { firstName, lastName, email, password, role = 'staff', username, is_active = true, position_id } = userData;
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // If position_id is not provided but role is, try to find position by name
      let finalPositionId = position_id;
      if (!finalPositionId && role && role !== 'staff') {
        try {
          const positionResult = await queryOne('SELECT id FROM position WHERE name = ? LIMIT 1', [role]);
          if (positionResult) {
            finalPositionId = positionResult.id;
          }
        } catch (positionError) {
          console.warn('Could not find position by role name:', role);
        }
      }
      
      const sql = `
        INSERT INTO user (first_name, last_name, email, position_id, username, password_hash, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const result = await query(sql, [
        firstName,
        lastName,
        email,
        finalPositionId,
        username,
        hashedPassword,
        is_active
      ]);

      // Return the created user (without password)
      return await this.findById(result.insertId);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async update(id, updateData) {
    try {
      // Build dynamic update query
      const updateFields = [];
      const values = [];
      
      if (updateData.firstName) {
        updateFields.push('first_name = ?');
        values.push(updateData.firstName);
      }
      if (updateData.lastName) {
        updateFields.push('last_name = ?');
        values.push(updateData.lastName);
      }
      if (updateData.email) {
        updateFields.push('email = ?');
        values.push(updateData.email);
      }
      if (updateData.role || updateData.position_id) {
        if (updateData.position_id) {
          updateFields.push('position_id = ?');
          values.push(updateData.position_id);
        } else if (updateData.role) {
          // Try to find position by name if role is provided
          try {
            const positionResult = await queryOne('SELECT id FROM position WHERE name = ? LIMIT 1', [updateData.role]);
            if (positionResult) {
              updateFields.push('position_id = ?');
              values.push(positionResult.id);
            }
          } catch (positionError) {
            console.warn('Could not find position by role name:', updateData.role);
          }
        }
      }
      if (updateData.password) {
        const hashedPassword = await hashPassword(updateData.password);
        updateFields.push('password_hash = ?');
        values.push(hashedPassword);
      }
      if (updateData.lastLogin) {
        updateFields.push('updated_at = ?');
        values.push(updateData.lastLogin);
      }
      if (updateData.is_active !== undefined) {
        updateFields.push('is_active = ?');
        values.push(updateData.is_active);
      }
      
      updateFields.push('updated_at = NOW()');
      values.push(id);
      
      if (updateFields.length === 1) { // Only updated_at was added
        return await this.findById(id);
      }
      
      const sql = `
        UPDATE user 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `;
      
      await query(sql, values);
      return await this.findById(id);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async updatePassword(id, newPassword) {
    try {
      const hashedPassword = await hashPassword(newPassword);
      
      const sql = `
        UPDATE user 
        SET password_hash = ?, updated_at = NOW()
        WHERE id = ?
      `;
      
      await query(sql, [hashedPassword, id]);
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  static async findAll(limit = 50, offset = 0) {
    try {
      const sql = `
        SELECT u.id, u.first_name, u.last_name, u.email, 
               COALESCE(p.name, 'No Position') as role, 
               u.username, u.is_active, u.created_at, u.updated_at
        FROM user u
        LEFT JOIN position p ON u.position_id = p.id
        ORDER BY u.created_at DESC
        LIMIT ? OFFSET ?
      `;
      const users = await query(sql, [limit, offset]);
      return this.transformUsers(users);
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  static async getAllUsers(limit = 50, offset = 0) {
    return this.findAll(limit, offset);
  }

  static async getUserCount() {
    try {
      const sql = 'SELECT COUNT(*) as count FROM user';
      const result = await queryOne(sql);
      return result.count;
    } catch (error) {
      console.error('Error getting user count:', error);
      throw error;
    }
  }

  static async deleteUser(id) {
    try {
      // In a real scenario, you might want to soft delete
      // For now, we'll actually delete the user
      const sql = 'DELETE FROM user WHERE id = ?';
      await query(sql, [id]);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  static async emailExists(email, excludeId = null) {
    try {
      let sql = 'SELECT id FROM user WHERE email = ?';
      const params = [email];
      
      if (excludeId) {
        sql += ' AND id != ?';
        params.push(excludeId);
      }
      
      const result = await queryOne(sql, params);
      return !!result;
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw error;
    }
  }

  static async usernameExists(username, excludeId = null) {
    try {
      let sql = 'SELECT id FROM user WHERE username = ?';
      const params = [username];
      
      if (excludeId) {
        sql += ' AND id != ?';
        params.push(excludeId);
      }
      
      const result = await queryOne(sql, params);
      return !!result;
    } catch (error) {
      console.error('Error checking username existence:', error);
      throw error;
    }
  }

  static async getAllPositions() {
    try {
      const sql = 'SELECT id, name, created_at, updated_at FROM position ORDER BY name ASC';
      const positions = await query(sql);
      return positions;
    } catch (error) {
      console.error('Error getting all positions:', error);
      throw error;
    }
  }

  static async getPositionById(id) {
    try {
      const sql = 'SELECT id, name, created_at, updated_at FROM position WHERE id = ? LIMIT 1';
      const position = await queryOne(sql, [id]);
      return position;
    } catch (error) {
      console.error('Error getting position by ID:', error);
      throw error;
    }
  }
}

module.exports = UserService;