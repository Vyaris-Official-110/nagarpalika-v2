import api from "./index";
import { ENDPOINTS } from "./endpoints";

export const searchCallLetters = (params) =>
    api.post(ENDPOINTS.CALL_LETTERS.SEARCH, params);

export const getCallLetterById = (id) =>
    api.get(ENDPOINTS.CALL_LETTERS.BY_ID(id));

export const updateCallLetter = (id, data) =>
    api.patch(ENDPOINTS.CALL_LETTERS.UPDATE(id), data);

export default { searchCallLetters, getCallLetterById, updateCallLetter };
