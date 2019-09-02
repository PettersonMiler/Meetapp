import * as Yup from 'yup';
import { parseISO, isBefore, format } from 'date-fns';
import { Op } from 'sequelize';
import File from '../models/File';
import Meetups from '../models/Meetups';
// import Notification from '../schemas/Notification';
// import CancellationMail from '../jobs/CancellationMail';
// import Queue from '../../lib/Queue';

class MeetupsController {
  async index(req, res) {
    const meetups = await Meetups.findAll({
      where: {
        organizer_id: req.userId,
        date: {
          [Op.gt]: new Date(),
        },
      },
      order: ['date'],
      attributes: ['id', 'title', 'description', 'location', 'date'],
      include: [
        {
          model: File,
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json(meetups);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      banner: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    // Check for past dates

    const hourStart = parseISO(req.body.date);

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    const meetup = await Meetups.create({
      ...req.body,
      organizer_id: req.userId,
    });

    return res.json(meetup);
  }

  async delete(req, res) {
    // const appointment = await Appointment.findByPk(req.params.id, {
    //   include: [
    //     {
    //       model: User,
    //       as: 'provider',
    //       attributes: ['name', 'email'],
    //     },
    //     {
    //       model: User,
    //       as: 'user',
    //       attributes: ['name'],
    //     },
    //   ],
    // });

    const meetup = await Meetups.findByPk(req.params.id);

    if (!meetup) {
      return res.status(400).json({
        error: "Meetup doesn't exist",
      });
    }

    if (meetup.organizer_id !== req.userId) {
      return res.status(401).json({
        error: "You don't have permission to cancel this meetup.",
      });
    }

    const isPastMeetup = parseISO(
      format(meetup.date, "yyyy-MM-dd'T'HH:mm:ssxxx")
    );

    if (isBefore(isPastMeetup, new Date())) {
      return res.status(400).json({ error: 'Past meetings cannot cancel' });
    }

    await meetup.destroy();

    // await Queue.add(CancellationMail.key, {
    //   appointment,
    // });

    return res.json({ response: 'Meetup canceled' });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      banner: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const meetup = await Meetups.findByPk(req.params.id);

    if (!meetup) {
      return res.status(400).json({ error: "Meetup doesn't exist" });
    }

    if (meetup.organizer_id !== req.userId) {
      return res
        .status(401)
        .json({ error: 'Only the organizer can edit meetup' });
    }

    const isPastMeetup = parseISO(
      format(meetup.date, "yyyy-MM-dd'T'HH:mm:ssxxx")
    );

    if (isBefore(isPastMeetup, new Date())) {
      return res
        .status(400)
        .json({ error: 'Past meetings cannot receive updates' });
    }

    const hourStart = parseISO(req.body.date);

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    const meetupUpdate = await meetup.update({
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      date: req.body.date,
      banner: req.body.banner,
    });

    return res.json(meetupUpdate);
  }
}

export default new MeetupsController();
