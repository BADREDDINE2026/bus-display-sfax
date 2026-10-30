export interface BusDeparture {
  voyage: string;
  voyage_fr: string;
  t_depart: string;
  t_arrivee: string;
  bus: string;
  status: string;
  status_fr: string;
}

export interface OrdsApiResponse {
  items: BusDeparture[];
  hasMore: boolean;
  limit: number;
  offset: number;
  count: number;
}