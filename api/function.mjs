import { reqHandler } from '../dist/fiap-question-form/server/server.mjs';

export default function (req, res) {
  return reqHandler(req, res);
}