export default {
  /***
   * IMAGING
   */
  ADD_IMAGING(state, imaging) {
    state.imagings.unshift(imaging);
  },

  SET_IMAGINGS(state, imagings) {
    state.imagings = imagings;
  },

  SET_IMAGINGS_TOTAL(state, total) {
    state.total = total;
  },

  SET_NUMB_PAGES(state, pages) {
    state.pages = pages;
  },

  SET_IMAGING(state, imaging) {
    state.imaging = imaging;
  },

  UPDATE_IMAGING(state, imaging) {
    const imagingIndex = state.imagings.findIndex((p) => p.id === imaging.id);
    Object.assign(state.imagings[imagingIndex], imaging);
  },

  /***
   * INVESTIGATIONS
   */
  ADD_INVESTIGATION(state, investigation) {
    state.investigations.unshift(investigation);
  },

  SET_INVESTIGATIONS(state, investigations) {
    state.investigations = investigations;
  },

  SET_INVESTIGATIONS_TOTAL(state, total) {
    state.totalInvestigation = total;
  },

  SET_INVESTIGATION_NUMB_PAGES(state, pages) {
    state.investigationPages = pages;
  },

  SET_INVESTIGATION(state, investigation) {
    state.investigation = investigation;
  },

  UPDATE_INVESTIGATION(state, investigation) {
    const investigationIndex = state.investigations.findIndex((p) => p.id === investigation.id);
    Object.assign(state.investigations[investigationIndex], investigation);
  },

  /***
   * REQUESTED INVESTIGATIONS
   */
  SET_REQUESTED_INVESTIGATION(state, investigation) {
    state.reqInvestigation = investigation;
  },

  SET_REQUESTED_INVESTIGATIONS(state, investigations) {
    state.reqInvestigations = investigations;
  },

  SET_REQUESTED_INVESTIGATIONS_TOTAL(state, total) {
    state.totalReqInvestigation = total;
  },

  SET_REQUESTED_INVESTIGATIONS_PAGES(state, pages) {
    state.totalReqInvestigationPages = pages;
  },

  /***
   * INVESTIGATIONS RESULT
   */
  UPLOAD_RESULT_IMAGES(state, images) {
    state.resultImages = images;
  },

  SET_INVESTIGATION_RESULT(state, result) {
    state.result = result;
  },

  SET_INVESTIGATIONS_RESULTS(state, results) {
    state.results = results;
  },

  SET_INVESTIGATIONS_RESULTS_TOTAL(state, total) {
    state.totalInvestigationResults = total;
  },

  SET_INVESTIGATIONS_RESULTS_PAGES(state, pages) {
    state.totalInvestigationResultsPages = pages;
  },

  /***
   * INVESTIGATIONS APPROVAL
   */
  SET_INVESTIGATIONS_APPROVAL(state, investigations) {
    state.investigationsApprovals = investigations;
  },

  SET_INVESTIGATIONS_APPROVAL_TOTAL(state, total) {
    state.totalInvestigationsApproval = total;
  },

  SET_INVESTIGATIONS_APPROVAL_PAGES(state, pages) {
    state.totalInvestigationsApprovalPages = pages;
  },

  /**
   * INVESTIGATION PRESCRIPTION
   */
  SET_INVESTIGATION_PRESCRIPTION(state, investigation) {
    state.investigationPrescription = investigation;
  },

  /**
   * SELECTED INVESTIGATIONS
   */
  ADD_SELECTED_INVESTIGATION(state, test) {
    state.selectedInvestigations.push(test);
  },

  REMOVE_SELECTED_INVESTIGATION(state, investigation) {
    const investigationIndex = state.selectedInvestigations.findIndex(
      ({ id }) => id === investigation.id
    );
    state.selectedInvestigations.splice(investigationIndex, 1);
  },

  EMPTY_SELECTED_INVESTIGATIONS(state, investigations) {
    state.selectedInvestigations = investigations;
  },

  // eslint-disable-next-line no-unused-vars
  SET_UPDATED_INVESTIGATIONS_RESULTS(state, investigations) {},

  /***
   * INVESTIGATION IMAGES (Phase 5)
   */
  SET_INVESTIGATION_IMAGES(state, images) {
    state.investigationImages = images;
  },

  SET_CURRENT_INVESTIGATION_IMAGES(state, images) {
    state.currentInvestigationImages = images;
  },

  ADD_INVESTIGATION_IMAGE(state, image) {
    state.currentInvestigationImages.unshift(image);
    state.investigationImages.unshift(image);
  },

  REMOVE_INVESTIGATION_IMAGE(state, imageId) {
    const currentIndex = state.currentInvestigationImages.findIndex((img) => img.id === imageId);
    if (currentIndex !== -1) {
      state.currentInvestigationImages.splice(currentIndex, 1);
    }
    const allIndex = state.investigationImages.findIndex((img) => img.id === imageId);
    if (allIndex !== -1) {
      state.investigationImages.splice(allIndex, 1);
    }
  },

  UPDATE_IMAGE_ORDER(state, { imageId, displayOrder }) {
    const currentImage = state.currentInvestigationImages.find((img) => img.id === imageId);
    if (currentImage) {
      currentImage.display_order = displayOrder;
    }
    const allImage = state.investigationImages.find((img) => img.id === imageId);
    if (allImage) {
      allImage.display_order = displayOrder;
    }
  },

  SET_PRIMARY_IMAGE(state, imageId) {
    // Reset all images to not primary
    state.currentInvestigationImages.forEach((img) => {
      img.is_primary = false;
    });
    state.investigationImages.forEach((img) => {
      img.is_primary = false;
    });

    // Set the specified image as primary
    const currentImage = state.currentInvestigationImages.find((img) => img.id === imageId);
    if (currentImage) {
      currentImage.is_primary = true;
    }
    const allImage = state.investigationImages.find((img) => img.id === imageId);
    if (allImage) {
      allImage.is_primary = true;
    }
  },

  UPDATE_INVESTIGATION_IMAGE(state, updatedImage) {
    const currentIndex = state.currentInvestigationImages.findIndex(
      (img) => img.id === updatedImage.id
    );
    if (currentIndex !== -1) {
      Object.assign(state.currentInvestigationImages[currentIndex], updatedImage);
    }
    const allIndex = state.investigationImages.findIndex((img) => img.id === updatedImage.id);
    if (allIndex !== -1) {
      Object.assign(state.investigationImages[allIndex], updatedImage);
    }
  },

  SET_DICOM_METADATA(state, metadata) {
    state.dicomMetadata = metadata;
  },

  SET_UPLOAD_PROGRESS(state, { fileId, progress }) {
    state.uploadProgress = {
      ...state.uploadProgress,
      [fileId]: progress,
    };
  },

  CLEAR_UPLOAD_PROGRESS(state) {
    state.uploadProgress = {};
  },

  SET_IMAGE_UPLOAD_ERROR(state, error) {
    state.imageUploadErrors.push(error);
  },

  CLEAR_IMAGE_UPLOAD_ERRORS(state) {
    state.imageUploadErrors = [];
  },

  CLEAR_INVESTIGATION_IMAGES(state) {
    state.investigationImages = [];
    state.currentInvestigationImages = [];
    state.dicomMetadata = null;
    state.uploadProgress = {};
    state.imageUploadErrors = [];
  },

  /**
   * COMBO INVESTIGATIONS
   */
  SET_COMBO_INVESTIGATIONS(state, comboInvestigations) {
    state.comboInvestigations = comboInvestigations;
  },

  SET_COMBO_INVESTIGATION(state, comboInvestigation) {
    state.comboInvestigation = comboInvestigation;
  },

  SET_COMBO_INVESTIGATIONS_TOTAL(state, total) {
    state.totalComboInvestigations = total;
  },

  SET_COMBO_INVESTIGATIONS_PAGES(state, pages) {
    state.totalComboInvestigationsPages = pages;
  },

  ADD_COMBO_INVESTIGATION(state, comboInvestigation) {
    state.comboInvestigations.unshift(comboInvestigation);
  },

  UPDATE_COMBO_INVESTIGATION(state, comboInvestigation) {
    const index = state.comboInvestigations.findIndex((t) => t.id === comboInvestigation.id);
    if (index !== -1) {
      Object.assign(state.comboInvestigations[index], comboInvestigation);
    }
  },

  REMOVE_COMBO_INVESTIGATION(state, id) {
    const index = state.comboInvestigations.findIndex((t) => t.id === id);
    if (index !== -1) {
      state.comboInvestigations.splice(index, 1);
    }
  },
};
