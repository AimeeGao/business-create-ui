// Libraries and mixins
import { Component, Mixins } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'
import { DateMixin } from '@/mixins'

// Interfaces
import { ActionBindingIF, BusinessContactIF, CertifyIF, DateTimeIF, DefineCompanyIF,
  IncorporationAgreementIF, IncorporationFilingIF, NameTranslationIF, PeopleAndRoleIF,
  ShareStructureIF } from '@/interfaces'

// Constants and enums
import { INCORPORATION_APPLICATION } from '@/constants'
import { CorpTypeCd } from '@/enums'

/**
 * Mixin that provides the integration with the Legal API.
 */
@Component({})
export default class FilingTemplateMixin extends Mixins(DateMixin) {
  @Getter isTypeBcomp!: boolean
  @Getter isNamedBusiness!: boolean
  @Getter getNameRequestNumber!: string
  @Getter getApprovedName!: string
  @Getter getTempId!: string
  @Getter getIncorporationDateTime!: DateTimeIF
  @Getter getEntityType!: CorpTypeCd
  @Getter getCurrentDate!: string
  @Getter getCertifyState!: CertifyIF
  @Getter getDefineCompanyStep!: DefineCompanyIF
  @Getter getNameTranslations!: NameTranslationIF[]
  @Getter getAddPeopleAndRoleStep!: PeopleAndRoleIF
  @Getter getCreateShareStructureStep!: ShareStructureIF
  @Getter getIncorporationAgreementStep!: IncorporationAgreementIF
  @Getter getBusinessContact!: BusinessContactIF
  @Getter getRules!: any
  @Getter getMemorandum!: any

  @Action setEntityType!: ActionBindingIF
  @Action setBusinessContact!: ActionBindingIF
  @Action setOfficeAddresses!: ActionBindingIF
  @Action setNameTranslationState!: ActionBindingIF
  @Action setDefineCompanyStepValidity!: ActionBindingIF
  @Action setNameRequestState!: ActionBindingIF
  @Action setOrgPersonList!: ActionBindingIF
  @Action setCertifyState!: ActionBindingIF
  @Action setShareClasses!: ActionBindingIF
  @Action setEffectiveDate!: ActionBindingIF
  @Action setIsFutureEffective!: ActionBindingIF
  @Action setFolioNumber!: ActionBindingIF
  @Action setIncorporationAgreementStepData!: ActionBindingIF
  @Action setRules!: ActionBindingIF
  @Action setMemorandum!: ActionBindingIF

  /**
   * Constructs a filing body from store data. Used when saving a filing.
   * @returns the filing body to save
   */
  buildFiling (): IncorporationFilingIF {
    // Build filing.
    const filing: IncorporationFilingIF = {
      filing: {
        header: {
          name: INCORPORATION_APPLICATION,
          certifiedBy: this.getCertifyState.certifiedBy,
          date: this.getCurrentDate,
          folioNumber: this.getDefineCompanyStep.folioNumber,
          isFutureEffective: this.getIncorporationDateTime.isFutureEffective
        },
        business: {
          legalType: this.getEntityType,
          identifier: this.getTempId
        },
        incorporationApplication: {
          nameRequest: {
            legalType: this.getEntityType
          },
          nameTranslations: this.getNameTranslations,
          offices: this.getDefineCompanyStep.officeAddresses,
          contactPoint: {
            email: this.getBusinessContact.email,
            phone: this.getBusinessContact.phone,
            extension: this.getBusinessContact.extension
          },
          parties: this.getAddPeopleAndRoleStep.orgPeople
        }
      }
    }

    // Conditionally add the entity-specific sections.
    switch (this.getEntityType) {
      case CorpTypeCd.COOP:
        filing.filing.incorporationApplication.rules = this.getRules
        filing.filing.incorporationApplication.memorandum = this.getMemorandum
        break
      case CorpTypeCd.BENEFIT_COMPANY:
      case CorpTypeCd.BC_CCC:
      case CorpTypeCd.BC_COMPANY:
      case CorpTypeCd.BC_ULC_COMPANY:
        filing.filing.incorporationApplication.shareStructure = {
          shareClasses: this.getCreateShareStructureStep.shareClasses
        }
        filing.filing.incorporationApplication.incorporationAgreement = {
          agreementType: this.getIncorporationAgreementStep.agreementType
        }
        break
    }

    // If this is a named IA then add Name Request Number and Approved Name.
    if (this.isNamedBusiness) {
      filing.filing.incorporationApplication.nameRequest.nrNumber = this.getNameRequestNumber
      filing.filing.incorporationApplication.nameRequest.legalName = this.getApprovedName
    }

    // If this is a future effective filing then add the effective date.
    const effectiveDate = this.getIncorporationDateTime.effectiveDate
    if (effectiveDate) {
      filing.filing.header.effectiveDate = this.dateToApi(effectiveDate)
    }

    return filing
  }

  /**
   * Parses a draft filing into the store. Used when resuming a filing.
   * @param draftFiling the filing body to parse
   */
  parseDraft (draftFiling: any): void {
    // FUTURE: set types so each of these validate their parameters
    // ref: https://www.typescriptlang.org/docs/handbook/generics.html

    // NB: don't parse Name Request object -- NR is fetched from namex/NRO instead

    // Set Entity Type
    this.setEntityType(draftFiling.business.legalType)

    // Set Office Addresses
    this.setOfficeAddresses(draftFiling.incorporationApplication.offices)

    // Set Name Translations
    this.setNameTranslationState(draftFiling.incorporationApplication.nameTranslations || [])

    // Set Contact Info
    const draftContact = {
      ...draftFiling.incorporationApplication.contactPoint,
      confirmEmail: draftFiling.incorporationApplication.contactPoint.email
    }
    this.setBusinessContact(draftContact)

    // Set Persons and Organizations
    this.setOrgPersonList(draftFiling.incorporationApplication.parties)

    // Conditionally parse the entity-specific sections.
    switch (this.getEntityType) {
      case CorpTypeCd.COOP:
        // Set Rules
        this.setRules(draftFiling.incorporationApplication.rules)
        // Set Memorandum
        this.setMemorandum(draftFiling.incorporationApplication.memorandum)
        break
      case CorpTypeCd.BENEFIT_COMPANY:
      case CorpTypeCd.BC_CCC:
      case CorpTypeCd.BC_COMPANY:
      case CorpTypeCd.BC_ULC_COMPANY:
        // Set Share Structure
        this.setShareClasses(draftFiling.incorporationApplication.shareStructure
          ? draftFiling.incorporationApplication.shareStructure.shareClasses : [])
        // Set Incorporation Agreement
        this.setIncorporationAgreementStepData({
          agreementType: draftFiling.incorporationApplication.incorporationAgreement?.agreementType
        })
        break
    }

    // Set Certify Form
    this.setCertifyState({
      valid: false,
      certifiedBy: draftFiling.header.certifiedBy
    })

    // Check that Effective Date is in the future, to improve UX and
    // to work around the default effective date set by the back end.
    // NB: may be undefined/null
    const draftEffectiveDate = this.apiToDate(draftFiling.header.effectiveDate)
    // NB: null is not >= "now"
    const effectiveDate = (draftEffectiveDate >= new Date()) ? draftEffectiveDate : null

    // Set Future Effective Time
    this.setEffectiveDate(effectiveDate)
    this.setIsFutureEffective(!!effectiveDate)

    // Set Folio Number
    this.setFolioNumber(draftFiling.header.folioNumber)
  }
}
