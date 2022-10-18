/**
 * @param res response
 * @param {Number} status status code
 * @param payload data when status code 200
 */
const returnStatus = ( res, status, payload) => {
  switch(status) {
    case 200: return res.status(200).json({ message: 'Success', data: payload})
    case 403: return res.status(403).json({ message: 'Forbidden' });
    case 400: return res.status(400).json({ message: 'Bad Request' });
    case 404: return res.status(400).json({ message: 'Not Found' });
    case 500: return res.status(500).json({ message: 'Internal Server' });
    default: return res.status(status);
  }
}

export default returnStatus;