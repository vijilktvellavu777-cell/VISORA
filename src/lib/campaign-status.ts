export const CAMPAIGN_STATUS_CREATING = "creating";
export const CAMPAIGN_STATUS_DRAFT = "draft";

export function isWizardEditableStatus(status: string) {
  return status === CAMPAIGN_STATUS_DRAFT || status === CAMPAIGN_STATUS_CREATING;
}

export function isListedCampaignStatus(status: string) {
  return status !== CAMPAIGN_STATUS_CREATING;
}
