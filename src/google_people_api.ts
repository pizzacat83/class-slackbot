export interface Person {
  resourceName: string;
  etag: string;
  names?: Name[];
  // TODO: add other properties
  // https://developers.google.com/people/api/rest/v1/people
}

export interface Name {
  displayName: string;
  // TODO: add other properties
  // https://developers.google.com/people/api/rest/v1/people#Person.Name
}
