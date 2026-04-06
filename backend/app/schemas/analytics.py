from pydantic import BaseModel


class ZoneDemandSupplyItem(BaseModel):
    zone: str
    demand_count: int
    supply_count: int
    shortage: int


class ClusterDistributionItem(BaseModel):
    cluster_label: str
    count: int


class WaitingListItem(BaseModel):
    cluster_label: str
    pending_requests: int


class HeatmapItem(BaseModel):
    zone: str
    demand_intensity: int
    supply_intensity: int


class AnalyticsOverview(BaseModel):
    demand_supply: list[ZoneDemandSupplyItem]
    parent_clusters: list[ClusterDistributionItem]
    childminder_clusters: list[ClusterDistributionItem]
    waiting_list: list[WaitingListItem]
    heatmap: list[HeatmapItem]