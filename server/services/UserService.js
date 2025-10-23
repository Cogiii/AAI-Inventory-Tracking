const { query, queryOne } = require('../config/database');
const { hashPassword } = require('../utils/password');

class UserService {
  // Find user by email
  static async findByEmail(email) {
    try {
      const sql = `
        SELECT id, first_name, last_name, email, position as role, 
               username, password_hash as password, created_at, updated_at
        FROM user 
        WHERE email = ? 
        LIMIT 1
      `;
      const user = await queryOne(sql, [email]);
      if (user) {
        user.isActive = true; // Set default for compatibility
        user.firstName = user.first_name;
        user.lastName = user.last_name;
      }
      return user;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const sql = `
        SELECT id, first_name, last_name, email, position as role, 
               username, created_at, updated_at
        FROM user 
        WHERE id = ? 
        LIMIT 1
      `;
      const user = await queryOne(sql, [id]);
      if (user) {
        user.isActive = true;
        user.firstName = user.first_name;
        user.lastName = user.last_name;
      }
      return user;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  // Find user by username
  static async findByUsername(username) {
    try {
      const sql = `
        SELECT id, first_name, last_name, email, position as role, 
               username, password_hash as password, created_at, updated_at
        FROM user 
        WHERE username = ? 
        LIMIT 1
      `;
      const user = await queryOne(sql, [username]);
      if (user) {
        user.isActive = true;
        user.firstName = user.first_name;
        user.lastName = user.last_name;
      }
      return user;
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }

  // Create new user
  static async create(userData) {
    try {
      const { firstName, lastName, email, password, role = 'staff', username } = userData;
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      const sql = `
        INSERT INTO user (first_name, last_name, email, position, username, password_hash)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const result = await query(sql, [
        firstName,
        lastName,
        email,
        role,
        username,
        hashedPassword
      ]);

      // Return the created user (without password)
      return await this.findById(result.insertId);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Update user
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
      if (updateData.role) {
        updateFields.push('position = ?');
        values.push(updateData.role);
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

  // Update password
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

  // Get all users (for admin)
  static async findAll(limit = 50, offset = 0) {
    try {
      const sql = `
        SELECT id, first_name, last_name, email, position as role, 
               username, created_at, updated_at
        FROM user 
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;
      const users = await query(sql, [limit, offset]);
      return users.map(user => ({
        ...user,
        isActive: true,
        firstName: user.first_name,
        lastName: user.last_name
      }));
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  // Get all users (alias for compatibility)
  static async getAllUsers(limit = 50, offset = 0) {
    return this.findAll(limit, offset);
  }

  // Get user count
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

  // Delete user (soft delete by deactivating)
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

  // Check if email exists
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

  // Check if username exists
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
}

module.exports = UserService;