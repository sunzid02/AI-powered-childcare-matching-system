export type Totals = {
  total_parents: number;
  total_childminders: number;
  total_requests: number;
  total_matches: number;
};

export type ZoneDemandSupplyItem = {
  zone: string;
  demand_count: number;
  supply_count: number;
  shortage: number;
};

export type ClusterDistributionItem = {
  cluster_label: string;
  count: number;
};

export type WaitingListItem = {
  cluster_label: string;
  pending_requests: number;
};

export type HeatmapItem = {
  zone: string;
  demand_intensity: number;
  supply_intensity: number;
};

export type AnalyticsOverview = {
  totals: Totals;
  demand_supply: ZoneDemandSupplyItem[];
  parent_clusters: ClusterDistributionItem[];
  childminder_clusters: ClusterDistributionItem[];
  waiting_list: WaitingListItem[];
  heatmap: HeatmapItem[];
};