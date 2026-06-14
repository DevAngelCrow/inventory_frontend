export interface RouteParentAutocomplete {
  data: {
    title: string;
    id: string;
    uri: string;
    parent: object;
    name: string;
  }[];
  statusCode: number;
}
