import { AccountTypes, CorpTypeCd, RoleTypes } from '@/enums'
import {
  AccountInformationIF,
  BusinessContactIF,
  CertifyIF,
  CreateMemorandumIF,
  CreateRulesIF,
  DateTimeIF,
  DefineCompanyIF,
  IncorporationAddressIF,
  IncorporationAgreementIF,
  NameRequestApplicantIF,
  NameRequestDetailsIF,
  NameRequestIF,
  NameTranslationIF,
  PeopleAndRoleIF,
  ShareStructureIF,
  StateIF,
  TombstoneIF
} from '@/interfaces'
import { getMaxStep } from './resource-getters'

//
// The getters in this file return values from the current state model.
//

/** Whether the user has "staff" keycloak role. */
export const isRoleStaff = (state: StateIF): boolean => {
  return getTombstone(state).keycloakRoles.includes('staff')
}

/** Whether the user is authorized to edit. */
export const isAuthEdit = (state: StateIF): boolean => {
  return getTombstone(state).authRoles.includes('edit')
}

/** Whether the user is authorized to view. */
export const isAuthView = (state: StateIF): boolean => {
  return getTombstone(state).authRoles.includes('view')
}

/** Whether the entity type has been identified. */
export const isEntityType = (state: StateIF): boolean => {
  return !!getEntityType(state)
}

/** The current entityType. */
export const getEntityType = (state: StateIF): CorpTypeCd => {
  return state.stateModel.entityType
}

/** Whether the entity is a BCOMP. */
export const isTypeBcomp = (state: StateIF): boolean => {
  return (state.stateModel.entityType === CorpTypeCd.BENEFIT_COMPANY)
}

/** Whether the entity is a COOP. */
export const isTypeCoop = (state: StateIF): boolean => {
  return (state.stateModel.entityType === CorpTypeCd.COOP)
}

/** Whether the entity is Community Contribution Company. */
export const isTypeCC = (state: StateIF): boolean => {
  return (state.stateModel.entityType === CorpTypeCd.BC_CCC)
}

/** The Account Information object. */
export const getAccountInformation = (state: StateIF): AccountInformationIF => {
  return state.stateModel.accountInformation
}

/** Whether the entity is a base company (BEN, CC, BC, ULC). */
export const isBaseCompany = (state: StateIF): boolean => {
  return [
    CorpTypeCd.BENEFIT_COMPANY,
    CorpTypeCd.BC_CCC,
    CorpTypeCd.BC_COMPANY,
    CorpTypeCd.BC_ULC_COMPANY
  ].includes(getEntityType(state))
}

/** Whether the current account is a premium account. */
export const isPremiumAccount = (state: StateIF): boolean => {
  return (getAccountInformation(state).accountType === AccountTypes.PREMIUM)
}

/** The Current Date. */
export const getCurrentDate = (state: StateIF): string => {
  return state.stateModel.currentDate
}

/** The Filing ID. */
export const getFilingId = (state: StateIF): number => {
  return state.stateModel.filingId
}

/** The Temporary Business Identifier. */
export const getTempId = (state: StateIF): string => {
  return state.stateModel.tempId
}

/** Whether this IA is for a Named Business. */
export const isNamedBusiness = (state: StateIF): boolean => {
  // a named business has a NR number
  return !!getNameRequestNumber(state)
}

/** The Number of a Name Request. */
export const getNameRequestNumber = (state: StateIF): string => {
  return getNameRequest(state).nrNumber
}

/** The Approved Name of a Name Request. */
export const getApprovedName = (state: StateIF): string => {
  return (getNameRequestDetails(state) as NameRequestDetailsIF).approvedName
}

/** The Tombstone object. */
export const getTombstone = (state: StateIF): TombstoneIF => {
  return state.stateModel.tombstone
}

/** The Company Step object. */
export const getDefineCompanyStep = (state: StateIF): DefineCompanyIF => {
  return state.stateModel.defineCompanyStep
}

/** The Business Contact object. */
export const getBusinessContact = (state: StateIF): BusinessContactIF => {
  return getDefineCompanyStep(state).businessContact
}

/** The Rules object. */
export const getRules = (state: StateIF): any => {
  return {} // *** FUTURE
}

/** The Memorandum object. */
export const getMemorandum = (state: StateIF): any => {
  return {} // *** FUTURE
}

/** The Add People and Role object. */
export const getAddPeopleAndRoleStep = (state: StateIF): PeopleAndRoleIF => {
  return state.stateModel.addPeopleAndRoleStep
}

/** The Create Share Structure object. */
export const getCreateShareStructureStep = (state: StateIF): ShareStructureIF => {
  return state.stateModel.createShareStructureStep
}

/** The Create Rules object. */
export const getCreateRulesStep = (state: StateIF): CreateRulesIF => {
  return state.stateModel.createRulesStep
}

/** The Incorporation Agreement object. */
export const getIncorporationAgreementStep = (state: StateIF): IncorporationAgreementIF => {
  return state.stateModel.incorporationAgreementStep
}

/** The Create Memorandum object. */
export const getCreateMemorandumStep = (state: StateIF): CreateMemorandumIF => {
  return state.stateModel.createMemorandumStep
}

/** The Incorporation Date-Time object. */
export const getIncorporationDateTime = (state: StateIF): DateTimeIF => {
  return state.stateModel.incorporationDateTime
}

/** The Name Request object. */
export const getNameRequest = (state: StateIF): NameRequestIF => {
  return state.stateModel.nameRequest
}

/** The Name Request Details object. */
export const getNameRequestDetails = (state: StateIF): NameRequestDetailsIF | {} => {
  return getNameRequest(state).details
}

/** The Name Request Applicant object. */
export const getNameRequestApplicant = (state: StateIF): NameRequestApplicantIF | {} => {
  return getNameRequest(state).applicant
}

/** The Name Translations object array. */
export const getNameTranslations = (state: StateIF): NameTranslationIF[] => {
  return state.stateModel.nameTranslations
}

/** The Office Addresses object. */
export const getOfficeAddresses = (state: StateIF): IncorporationAddressIF | {} => {
  return getDefineCompanyStep(state).officeAddresses
}

/** Whether we are ignoring data changes. */
export const ignoreChanges = (state: StateIF): boolean => {
  return state.stateModel.ignoreChanges
}

/** Whether there are unsaved data changes. */
export const getHaveChanges = (state: StateIF): boolean => {
  return state.stateModel.haveChanges
}

//
// Below is the business logic that allows the Stepper, the Actions, etc
// to know how they should behave (ie, what to show or enable).
//

/** The current step. */
export const getCurrentStep = (state: StateIF): number => {
  return state.stateModel.currentStep
}

/** Whether the app is busy saving. */
export const isSaving = (state: StateIF): boolean => {
  return state.stateModel.isSaving
}

/** Whether the app is busy saving and resuming. */
export const isSavingResuming = (state: StateIF): boolean => {
  return state.stateModel.isSavingResuming
}

/** Whether the app is busy filing and paying. */
export const isFilingPaying = (state: StateIF): boolean => {
  return state.stateModel.isFilingPaying
}

/** Whether the Back button should be displayed. */
export const isShowBackBtn = (state: StateIF): boolean => {
  return (getCurrentStep(state) > 1)
}

/** Whether the Review and Confirm button should be displayed. */
export const isShowReviewConfirmBtn = (state: StateIF): boolean => {
  return (!!getEntityType(state) && getCurrentStep(state) < getMaxStep(state))
}

/** Whether the File and Pay button should be displayed. */
export const isShowFilePayBtn = (state: StateIF): boolean => {
  return (getCurrentStep(state) === getMaxStep(state))
}

/** Whether the app is busy saving or resuming. */
export const isBusySaving = (state: StateIF): boolean => {
  return (isSaving(state) || isSavingResuming(state) || isFilingPaying(state))
}

/** Is true when the step is valid. */
export const isDefineCompanyValid = (state: StateIF): boolean => {
  return getDefineCompanyStep(state).valid
}

/** Is true when the step is valid. */
export const isAddPeopleAndRolesValid = (state: StateIF): boolean => {
  return getAddPeopleAndRoleStep(state).valid
}

/** Is true when the step is valid. */
export const isCreateShareStructureValid = (state: StateIF): boolean => {
  return getCreateShareStructureStep(state).valid
}

/** Is true when the step is valid. */
export const isIncorporationAgreementValid = (state: StateIF): boolean => {
  return getIncorporationAgreementStep(state).valid
}

/** Whether all the incorporation steps are valid. */
export const isApplicationValid = (state: StateIF): boolean => {
  // Base company steps
  const isBaseStepsValid = (
    getCreateShareStructureStep(state).valid &&
    getIncorporationDateTime(state).valid &&
    getIncorporationAgreementStep(state).valid
  )

  // Coop steps
  const isCoopStepsValid = (
    getCreateRulesStep(state).valid &&
    getCreateMemorandumStep(state).valid
  )

  return (
    getDefineCompanyStep(state).valid &&
    getAddPeopleAndRoleStep(state).valid &&
    // Validate different steps for Base Companies vs Coops
    isBaseCompany(state) ? isBaseStepsValid : isCoopStepsValid &&
    getCertifyState(state).valid &&
    !!getCertifyState(state).certifiedBy
  )
}

/** Is true when the user has tried to submit a filing. */
export const getValidateSteps = (state: StateIF): boolean => {
  return state.stateModel.validateSteps
}

/** Is true when the user should see the validation errors. */
export const getShowErrors = (state: StateIF): boolean => {
  return state.stateModel.showErrors
}

/** The Certify State object. */
export const getCertifyState = (state: StateIF): CertifyIF => {
  return state.stateModel.certifyState
}

/** The Completing Party's email address. */
export const getCompletingPartyEmail = (state: StateIF): string => {
  return (state.stateModel.tombstone.userEmail)
}
