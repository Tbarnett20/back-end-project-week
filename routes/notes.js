// ***** Notes ***** //
const router = require('express').Router();
const helpers = require('../db/helpers');
const _ = require('lodash');

// *****  ***** //
function reducerTag(ac, next) {
  //  accumulator can be an intimidating term, so you can think of it like the current state of the array as we're applying the logic on the callback's invocations/ Google Fu
  if (ac[next.id]) {
    ac[next.id].tags = [].concat(ac[next.id].tags).concat(next.tags);
  } else {
    ac[next.id] = next;
    ac[next.id].tags = next.tags ? [next.tags] : [];
  }
  return ac;
}

// #################### GET #################### //

// ******* GET ******* //
router.get('/', async (req, res, next) => {
  let notes = await helpers.getAllNotes();
  notes = notes.reduce(reducerTag, {});
  res.status(200).json(Object.values(notes));
});

// ******* GET Single Note ******* //
router.get('/:id', async (req, res, next) => {
  let note = await helpers.getOneNote(Number(req.params.id));
  note = Object.values(note.reduce(reducerTag, {}))[0];
  if (!note)
    return res.json({
      Error: `I'm not calling you a liar but....that ID doesn't exist`,
    });
  res.status(200).json(note);
});

// #################### POST #################### //
router.post('/', async (req, res, next) => {
  const { title, content, tags } = req.body;
  if (!title || !content)
  return res.json({ Error: 'Stop forgetting things' });
  let id = null;
  if (_.isArray(tags)) {
    id = await helpers.addNoteWithTags({ title, content }, tags);
  } else {
    id = await helpers.addNote({ title, content });
  }
  res.status(201).json({ Message: 'I think it worked', id });
});

// #################### PUT #################### //

router.put('/:id', async (req, res) => {
  let { title, content, tags } = req.body;
  if (!title && !content && !Array.isArray(tags))
  return res.json({ Error: `So you think I CAN JUST WORK WITH ONLY ONE THING FILLED OUT?!! THINK AGAIN...redo it please` });
  if (_.isArray(tags)) {
    try {
      let ids = await helpers.updateTags(tags, Number(req.params.id));
    } catch (err) {
      return res.json({ Error: `I'm not calling you a liar but....that ID doesn't exist` });
    }
  }
  let objUpdater = { title, content };
  objUpdater = _.omitBy(objUpdater, _.isUndefined);
  let count = await helpers.updateNote(objUpdater, Number(req.params.id));
  if (count === 0) return res.json({ Error: `I'm not calling you a liar but....that ID doesn't exist` });
  res.status(200)
    .json({ Message: `The note that had the id of ${req.params.id} has been updated...peacefully` });
});

// #################### DELETE #################### //

router.delete('/:id', async (req, res, next) => {
  let count = await helpers.deleteNote(Number(req.params.id));
  if (count === 0)
    return res.json({
      Error: `I'm not calling you a liar but....that ID doesn't exist`,
    });
  res.status(200).json({
    Message: `The note that had the id of ${req.params.id} has been destroyed...peacefully`,
  });
});

 module.exports = router;