/**
 * Company websites of the success-story clients, for the dashboard only (field "website").
 * Kept on the server so they never ship in the public site bundle; the public stories API strips the field too.
 * Left out on purpose: clients with no website found (only social pages) or no confirmed one.
 */
export const STORY_WEBSITES: Record<string, string> = {
  'alfajr-albasim-school': 'https://www.alfajr-albasim.com/',
  'range-star-cars': 'https://rangestar.sa/ar',
  'skipro-app': 'https://skipro.app/',
  'neqsa-sweet': 'https://neqsasweet.com',
  'piflow-accounting': 'https://www.piflow.net/',
  'global-health-saudi': 'https://www.globalhealthsaudi.com/',
  'saudi-dent': 'https://saudident.sa',
  'waha-construction': 'https://oasiscons.com',
  'lord-milano': 'https://lordmilanome.com/ar',
  'makkah-channel': 'https://makkahtv.tv',
  'tabz-app': 'https://tapsapps.com/ar/',
  'tasharuky': 'https://tasharuky.com',
  'shoor-platform': 'https://www.gdrfad.gov.ae/ar/shore',
  'arab-industry-co': 'https://aaic.com.sa',
  'cotech-it': 'https://coretech.sa/ar',
  'salamat-medical': 'https://stor.salamatgroup.com/ar',
  'flicker-line': 'https://www.flickerline.com',
  'alrayfan-jewelry': 'https://alrivan.sa/',
  'cloud-invoice': 'https://fatora.cloud/',
  'flato-furniture': 'https://vlaato.com/',
  'mcdonalds-saudi': 'https://www.mcdonalds.com/sa/ar-sa/riyadh/ourcompany.html',
  'knowledge-management-policies': 'https://www.moh.gov.sa',
  'power-gym': 'https://powergym.sa',
  'faal-law-firm': 'https://fal.sa/',
  // Instagram page (no website found for this client)
  'al-tair-insurance': 'https://www.instagram.com/altairmanagment/'
};
