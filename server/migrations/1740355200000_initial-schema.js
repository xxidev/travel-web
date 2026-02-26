/**
 * @type {import('node-pg-migrate').MigrationBuilder}
 */
exports.up = (pgm) => {
  pgm.createTable('users', {
    id: { type: 'serial', primaryKey: true },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    password: { type: 'varchar(255)', notNull: true },
    name: { type: 'varchar(100)', notNull: true },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  pgm.createIndex('users', 'email');

  pgm.createTable('itinerary_history', {
    id: { type: 'serial', primaryKey: true },
    user_id: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    destination: { type: 'varchar(255)', notNull: true },
    start_date: { type: 'varchar(20)', notNull: true },
    end_date: { type: 'varchar(20)', notNull: true },
    budget: { type: 'varchar(50)', notNull: true },
    currency: { type: 'varchar(10)', notNull: true, default: "'USD'" },
    preferences: { type: 'text', notNull: true, default: "''" },
    itinerary: { type: 'text', notNull: true },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  pgm.createIndex('itinerary_history', 'user_id');
};

exports.down = (pgm) => {
  pgm.dropTable('itinerary_history');
  pgm.dropTable('users');
};
