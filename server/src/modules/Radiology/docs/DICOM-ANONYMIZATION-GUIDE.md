# DICOM Anonymization Guide

## Overview

DICOM (Digital Imaging and Communications in Medicine) files often contain Protected Health Information (PHI) that must be handled according to HIPAA regulations and other privacy laws. This guide outlines the PHI detection and anonymization requirements for the EHMRS radiology system.

---

## Protected Health Information (PHI) in DICOM Files

### HIPAA Identifiers

The following DICOM tags contain PHI as defined by HIPAA:

#### Patient Information
- **Patient Name** (0010,0010): Full name of the patient
- **Patient ID** (0010,0020): Medical record number or patient identifier
- **Patient Birth Date** (0010,0030): Date of birth
- **Patient Sex** (0010,0040): Gender
- **Patient Age** (0010,1010): Age at time of study
- **Patient Address** (0010,1040): Home address
- **Patient Telephone Numbers** (0010,2154): Contact information

#### Physician Information
- **Referring Physician's Name** (0008,0090): Name of referring doctor
- **Performing Physician's Name** (0008,1050): Name of performing doctor
- **Operator's Name** (0008,1070): Name of equipment operator

#### Institution Information
- **Institution Name** (0008,0080): Name of healthcare facility
- **Institution Address** (0008,0081): Address of healthcare facility

#### Study & Series Information
- **Study Date** (0008,0020): Date study was performed
- **Series Date** (0008,0021): Date series was acquired
- **Study Time** (0008,0030): Time study was performed
- **Acquisition DateTime** (0008,002A): Specific acquisition timestamp

#### Unique Identifiers
- **Study Instance UID** (0020,000D): Unique study identifier
- **Series Instance UID** (0020,000E): Unique series identifier
- **SOP Instance UID** (0008,0018): Unique image identifier

---

## Current PHI Detection Implementation

### Automated Detection

The EHMRS system automatically detects PHI in uploaded DICOM files through the `DicomProcessorService.detectPhiInMetadata()` function:

```typescript
export interface PhiDetectionResult {
  hasPhiData: boolean;
  phiFields: string[];
  warnings: string[];
  recommendations: string[];
}
```

### Detection Coverage

**Currently Detected:**
- ✅ Patient Name
- ✅ Patient ID
- ✅ Patient Birth Date
- ✅ Patient Address
- ✅ Patient Telephone
- ✅ Referring Physician Name
- ✅ Performing Physician Name
- ✅ Institution Name

**Not Yet Detected (Future Enhancement):**
- ⚠️ Study/Series Dates & Times
- ⚠️ Operator Names
- ⚠️ Institution Addresses
- ⚠️ Additional HIPAA identifiers

---

## Warning System

### Upload Warnings

When a DICOM file with PHI is uploaded, the system generates:

1. **PHI Warning**: Lists specific fields containing PHI
2. **Security Recommendations**: Actionable guidance for handling the file

Example warning output:
```
⚠️ HIPAA/PHI Warning: DICOM file contains 5 Protected Health Information field(s)
   PHI Fields Found: Patient Name, Patient ID, Patient Birth Date, Referring Physician Name, Institution Name

🔒 Security Recommendations:
   • Patient identifiers detected - ensure proper access controls are in place
   • Patient demographic data present - consider data minimization
   • Physician information present - verify appropriate consent
   • Consider DICOM anonymization before sharing or exporting
   • Ensure audit logging is enabled for all access to this image
   • Verify HIPAA compliance for storage and transmission
```

### Logging

All PHI-containing files are:
- ✅ Logged during upload (via `logFileAccess`)
- ✅ Tracked in database with metadata
- ✅ Access-controlled via role-based permissions
- ✅ Logged on download/view operations

---

## Anonymization Requirements

### When Anonymization is Required

DICOM anonymization is **required** in the following scenarios:

1. **Research & Teaching**
   - Sharing images for medical education
   - Including images in research datasets
   - Publishing case studies

2. **External Sharing**
   - Transferring images to external facilities without patient consent
   - Cloud storage without appropriate safeguards
   - Third-party analysis tools

3. **Data Archival**
   - Long-term storage beyond retention requirements
   - Migration to new systems

4. **Legal & Compliance**
   - Regulatory audits requiring sanitized data
   - Patient privacy requests

### When Anonymization is NOT Required

Anonymization may be **unnecessary** when:

1. **Internal Clinical Use**
   - Images used within the treating healthcare facility
   - Proper access controls and audit logging in place
   - Covered by patient consent forms

2. **Care Coordination**
   - Sharing with other providers involved in patient's care
   - Covered by HIPAA treatment exceptions
   - Secure transmission methods used

3. **Legal Requirements**
   - Images needed for legal proceedings
   - Patient consent obtained
   - Court orders requiring non-anonymized data

---

## Anonymization Methods

### Recommended Tools

The EHMRS system does **not** currently implement DICOM anonymization internally. Use external tools:

#### 1. **DICOM Anonymizer** (Open Source)
- Repository: https://github.com/rordenlab/dcm2niix
- Features: Batch processing, configurable anonymization
- Best for: Research datasets

#### 2. **dcmtk** (DICOM Toolkit)
- Website: https://dicom.offis.de/dcmtk
- Command: `dcmodify` for tag modification
- Best for: Command-line automation

#### 3. **Clinical Trial Processor** (CTP)
- Website: http://mircwiki.rsna.org/index.php?title=CTP-The_RSNA_Clinical_Trial_Processor
- Features: Clinical trial anonymization, de-identification profiles
- Best for: Clinical trials

#### 4. **RadiAnt DICOM Viewer**
- Website: https://www.radiantviewer.com/
- Features: GUI-based anonymization
- Best for: Individual file processing

### Anonymization Levels

#### Level 1: Basic De-identification
Remove direct identifiers:
- Patient Name → "ANONYMIZED"
- Patient ID → Random ID or removed
- Study Date → Offset by random days
- Physician Names → Removed

#### Level 2: Enhanced De-identification
Remove all HIPAA identifiers:
- All Level 1 removals
- Institution information removed
- Study/Series UIDs regenerated
- Date/Time information offset

#### Level 3: Full Anonymization
Remove all potentially identifying information:
- All Level 2 removals
- Image metadata minimized
- Pixel data checked for burned-in annotations
- Equipment information generalized

---

## Implementation Status

### ✅ Completed
- PHI detection in uploaded DICOM files
- Comprehensive warning system
- Audit logging for file access
- Role-based access control
- Secure file storage with validation

### ⚠️ In Progress
- Documentation of anonymization requirements (this document)
- User interface warnings for PHI-containing files

### 📋 Future Enhancements
1. **Built-in Anonymization**
   - Implement server-side DICOM anonymization
   - Integration with dcmtk or similar library
   - User-configurable anonymization profiles

2. **Export with Anonymization**
   - Option to anonymize before download
   - Batch anonymization for research exports
   - Anonymization audit trail

3. **Advanced PHI Detection**
   - Detect burned-in annotations in pixel data
   - OCR for text in images
   - Machine learning-based PHI detection

4. **Compliance Reporting**
   - HIPAA compliance reports
   - PHI access audits
   - Anonymization history tracking

---

## Best Practices

### For Healthcare Providers

1. **Upload Best Practices**
   - Review PHI warnings during upload
   - Understand which images contain PHI
   - Document clinical necessity for PHI retention

2. **Access Control**
   - Only access images necessary for patient care
   - Do not share login credentials
   - Log out when finished

3. **External Sharing**
   - Always anonymize before sharing externally
   - Use encrypted transmission methods
   - Obtain appropriate consents

### For System Administrators

1. **Audit Logging**
   - Regularly review file access logs
   - Investigate suspicious access patterns
   - Maintain logs for required retention period

2. **Access Control**
   - Regularly review user permissions
   - Remove access for terminated employees
   - Implement least-privilege principle

3. **Data Protection**
   - Regular backups of image data
   - Encrypted storage at rest
   - Secure network transmission (HTTPS/TLS)

4. **Compliance Monitoring**
   - Regular HIPAA compliance audits
   - Stay updated on regulatory changes
   - Document anonymization procedures

---

## References

### HIPAA Guidance
- [HIPAA Privacy Rule](https://www.hhs.gov/hipaa/for-professionals/privacy/index.html)
- [De-identification Under HIPAA](https://www.hhs.gov/hipaa/for-professionals/privacy/special-topics/de-identification/index.html)

### DICOM Standards
- [DICOM Standard - Part 15: Security and System Management Profiles](https://www.dicomstandard.org/current)
- [DICOM Supplement 142: Clinical Trial De-identification Profiles](https://www.dicomstandard.org/supplements/)

### Best Practices
- [RSNA MIRC Clinical Trial Processor](http://mircwiki.rsna.org/index.php?title=MIRC_CTP)
- [NEMA PS3.15 - DICOM Security Profiles](https://www.dicomstandard.org/)

---

## Contact & Support

For questions about DICOM anonymization in EHMRS:
- **Technical Issues**: Contact system administrator
- **HIPAA Compliance**: Contact compliance officer
- **Feature Requests**: Submit via issue tracker

---

**Document Version**: 1.0
**Last Updated**: October 2025
**Maintained By**: EHMRS Development Team
**Review Frequency**: Quarterly or upon regulatory changes
