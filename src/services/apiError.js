// Turns an Axios error into something a form can show.
// Matches the backend's GlobalExceptionHandler:
//   400 -> { message, errors: { field: "message" } }
//   401 / 409 -> { message }
export function parseApiError(error) {
  if (!error.response) {
    return {
      status: null,
      message: 'Cannot reach the server. Check if the server is running.',
      fieldErrors: {},
    };
  }

  const { status, data } = error.response;
  return {
    status,
    message: data?.message ?? 'Something went wrong. Try again.',
    fieldErrors: data?.errors ?? {},
  };
}