import { paginateParams } from './params.paginate.interface';

export default interface paramsGeneric {
  paginateParams?: paginateParams;
  filter_name?: string | null;
  status?: boolean | null;
}
