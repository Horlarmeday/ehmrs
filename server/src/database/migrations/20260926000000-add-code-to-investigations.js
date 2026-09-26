'use strict';

// #83: catalogue code for investigations so charge.captured can carry item_code
// for all five line types. Backfills INV-#### by ascending id, then makes the
// column NOT NULL under a unique index. Codes are server-owned; nothing reads
// a client-supplied value.
const TABLE = 'Investigations';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(TABLE, 'code', {
      type: Sequelize.STRING(43),
      allowNull: true,
      after: 'name',
    });

    await queryInterface.sequelize.query(
      `UPDATE \`${TABLE}\` i
       JOIN (
         SELECT id, CONCAT('INV-', LPAD(ROW_NUMBER() OVER (ORDER BY id), 4, '0')) AS new_code
         FROM \`${TABLE}\`
       ) t ON i.id = t.id
       SET i.code = t.new_code`
    );

    await queryInterface.changeColumn(TABLE, 'code', {
      type: Sequelize.STRING(43),
      allowNull: false,
    });
    await queryInterface.addIndex(TABLE, ['code'], {
      name: 'uniq_investigations_code',
      unique: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex(TABLE, 'uniq_investigations_code');
    await queryInterface.removeColumn(TABLE, 'code');
  },
};
