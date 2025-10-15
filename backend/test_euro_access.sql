INSERT INTO euro_access_grants (
    source_id,
    source_url,
    title,
    title_mk,
    description,
    description_mk,
    deadline,
    days_left,
    url,
    type,
    tags,
    content_hash,
    raw_html,
    created_at,
    updated_at,
    funding_program,
    call_number,
    call_objectives,
    regions_countries_for_funding,
    eligible_entities,
    mandatory_partnership,
    project_partnership,
    topics,
    un_sdgs,
    additional_information,
    contact
  ) VALUES (
    'Euro-Access',
    'https://www.euro-access.eu/en/calls',
    'Erasmus Charter for Higher Education - 5th cut-off date',
    'Erasmus Charter for Higher Education - 5th cut-off date', -- Placeholder for Macedonian translation
    'short descriptionThis Call aims at accrediting recognised Higher Education Institutions located in eligible countries, which have operational capacity to take part in Erasmus+ Programme’s activities, such as learning mobility of individuals and/or cooperation for innovation and good practices.',
    'short descriptionThis Call aims at accrediting recognised Higher Education Institutions located in eligible countries, which have operational capacity to take part in Erasmus+ Programme’s activities, such as learning mobility of individuals and/or cooperation for innovation and good practices.', -- Placeholder for Macedonian translation
    NULL,
    NULL,
    'https://www.euro-access.eu/en/calls/135/Erasmus-Charter-for-Higher-Education-5th-cut-off-date',
    'grants',
    '["eu-funding", "erasmus"]',
    '75a26025196cd65b2261f1853a6def7d6e3450c42d40a43946b836b0187e4f08',
    '',
    NOW(),
    NOW(),
    'Erasmus+',
    'ERASMUS-EDU-2022-ECHE-CERT-FP',
    'The Erasmus Charter for Higher Education (ECHE) is an EU quality certificate for higher education institutions (HEIs). It is a prerequisite for all HEIs from Erasmus+ Programme countries and Western Balkans third countries not associated to the Programme to apply for funding under Erasmus+ calls (including calls managed by Erasmus+ National Agencies).

By applying for the ECHE, the HEI confirms that its participation in Erasmus+ is part of its strategy for modernisation and internationalisation. This strategy acknowledges the key contribution of student and staff mobility and of participation in transnational cooperation projects, to the quality of its higher education programmes and student experience. The ECHE aims to reinforce the quality of student and staff mobility, as well as of cooperation projects.

The certification procedure consists in validating the status as a ‘higher education institution (HEI)’ and certifying compliance with the ECHE quality standards (Erasmus Policy Statement, quality of organisation and management structures and the implementation of ECHE principles).

The ECHE will be valid for the entire duration of the Erasmus+ Programme 2021-2027 (and up until the end of projects funded under that Programme). The award of the ECHE does not automatically imply any direct funding under the Erasmus+ Programme.

ECHE holders will be subject to regular monitoring by the National Agencies.
read more',
    '',
    'eligible entitiesEducation and training institution, Research Institution incl. University',
    'Mandatory partnershipNo',
    'Project PartnershipIn order to be eligible, the applicant must:


	be a higher education institution (HEI) (public or private) and
	be established in one of the eligible countries, i.e. Erasmus+ Programme Countries:
	
		EU Member States (including overseas countries and territories (OCTs)) and
		non-EU countries:
		
			listed EEA (European Economic Area) countries and countries associated to the Erasmus+ Programme (associated countries) or countries which are in ongoing negotiations for an association agreement and where the agreement enters into force before grant signature
			Western Balkans third countries not associated to the Erasmus+ Programme: Albania, Bosnia and Herzegovina, Kosovo (This designation is without prejudice to positions on status, and is in line with UNSCR 1244 and the ICJ Opinion on the Kosovo declaration of independence) and Montenegro.',
    'Education & Training, Children & Youth, Media',
    'UN Sustainable Development Goals (UN-SDGs)',
    'Additional InformationProposals must be complete and contain all the requested information and all required annexes and supporting documents:


	Application Form Part A — contains administrative information about the participant (to be filled in directly online)
	Application Form Part B — contains the technical description of the project (EPS, HEI profile and organisation and management structure, implementation of the ECHE principles) (to be downloaded from the Portal Submission System, completed and then assembled and re-uploaded).


Applications are limited to maximum 25 pages (Part B).',
    'ContactEuropean Education and Culture Executive Agency        Website Erasmus+ National Agencies        Website'
  ) ON CONFLICT (content_hash) DO NOTHING;
