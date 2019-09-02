import Sequelize, { Model } from 'sequelize';

class Meetups extends Model {
  static init(sequelize) {
    super.init(
      {
        organizer_id: Sequelize.INTEGER,
        title: Sequelize.STRING,
        description: Sequelize.STRING,
        location: Sequelize.STRING,
        date: Sequelize.DATE,
        banner: Sequelize.INTEGER,
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'organizer_id',
      as: 'organizer',
    });
    this.belongsTo(models.File, { foreignKey: 'banner' });
  }
}

export default Meetups;
