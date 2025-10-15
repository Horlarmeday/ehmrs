import axios from '../../../../axios';

export default {
  addImaging({ commit }, imaging) {
    return new Promise((resolve, reject) => {
      axios
        .post('/radiology/imaging/create', imaging)
        .then((response) => {
          commit(
            'ADD_IMAGING',
            Object.assign(imaging, {
              id: response.data.data.id,
              createdAt: response.data.data.createdAt,
            })
          );
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  fetchImagings({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/radiology/imaging/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
          },
        })
        .then((response) => {
          commit('SET_IMAGINGS', response.data.data.docs);
          commit('SET_IMAGINGS_TOTAL', response.data.data.total);
          commit('SET_NUMB_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  updateImaging({ commit }, imaging) {
    return new Promise((resolve, reject) => {
      axios
        .patch(`/radiology/imaging/update`, imaging)
        .then((response) => {
          commit('UPDATE_IMAGING', response.data.data);
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  addInvestigation({ commit }, investigation) {
    return new Promise((resolve, reject) => {
      axios
        .post('/radiology/investigations/create', investigation)
        .then((response) => {
          commit('ADD_INVESTIGATION', response.data.data);
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  fetchInvestigations({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/radiology/investigations/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
            filter: payload.filter,
          },
        })
        .then((response) => {
          commit('SET_INVESTIGATIONS', response.data.data.docs);
          commit('SET_INVESTIGATIONS_TOTAL', response.data.data.total);
          commit('SET_INVESTIGATION_NUMB_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  updateInvestigation({ commit }, investigation) {
    return new Promise((resolve, reject) => {
      axios
        .patch(`/radiology/investigations/update`, investigation)
        .then((response) => {
          commit('UPDATE_INVESTIGATION', response.data.data);
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  /***
   * REQUESTED INVESTIGATIONS
   */
  fetchRequestedInvestigations({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/radiology/requested-investigations/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
            period: payload.period,
            start: payload.start,
            end: payload.end,
          },
        })
        .then((response) => {
          commit('SET_REQUESTED_INVESTIGATIONS', response.data.data.docs);
          commit('SET_REQUESTED_INVESTIGATIONS_TOTAL', response.data.data.total);
          commit('SET_REQUESTED_INVESTIGATIONS_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  fetchOneRequestedInvestigation({ commit, dispatch }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/radiology/requested-investigations/get/${payload.id}`)
        .then(async (response) => {
          commit('SET_REQUESTED_INVESTIGATION', response.data.data);

          // Fetch images for each investigation result if they exist
          if (response.data.data?.investigations) {
            for (const investigation of response.data.data.investigations) {
              if (investigation.result?.id) {
                try {
                  await dispatch('fetchInvestigationImages', investigation.result.id);
                } catch (error) {
                  console.error(`Failed to fetch images for result ${investigation.result.id}:`, error);
                }
              }
            }
          }

          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  uploadResultImages({ commit }, images) {
    return new Promise((resolve, reject) => {
      axios
        .post('/radiology/upload-images', images)
        .then((response) => {
          commit('UPLOAD_RESULT_IMAGES', response.data.data);
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  addInvestigationResult({ commit, dispatch }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/radiology/requested-investigations/add-result`, { results: payload })
        .then(async (response) => {
          commit('SET_INVESTIGATION_RESULT', response.data.data);

          // If images were uploaded during result addition, fetch them
          if (response.data.data?.id) {
            try {
              await dispatch('fetchInvestigationImages', response.data.data.id);
            } catch (error) {
              console.error('Failed to fetch newly added result images:', error);
            }
          }

          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  /***
   * INVESTIGATIONS APPROVAL
   */
  fetchInvestigationsApproval({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/radiology/investigations-approval/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
            start: payload.start,
            end: payload.end,
          },
        })
        .then((response) => {
          commit('SET_INVESTIGATIONS_APPROVAL', response.data.data.docs);
          commit('SET_INVESTIGATIONS_APPROVAL_TOTAL', response.data.data.total);
          commit('SET_INVESTIGATIONS_APPROVAL_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  approveInvestigationResult({ commit, getters }, payload) {
    return new Promise((resolve, reject) => {
      // Optional: Validate that required images exist before approval
      const hasImages = getters.hasImages;
      const imageCount = getters.imageCount;

      // Log validation info (can be extended based on requirements)
      if (!hasImages) {
        console.warn('Approving investigation result without images');
      } else {
        console.log(`Approving investigation result with ${imageCount} image(s)`);
      }

      axios
        .post(`/radiology/requested-investigations/approve/`, { results: payload })
        .then((response) => {
          commit('SET_INVESTIGATION_RESULT', response.data.data);
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  /**
   * RESULTS
   */
  fetchInvestigationsResults({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/radiology/investigations-results/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
            start: payload.start,
            end: payload.end,
          },
        })
        .then((response) => {
          commit('SET_INVESTIGATIONS_RESULTS', response.data.data.docs);
          commit('SET_INVESTIGATIONS_RESULTS_TOTAL', response.data.data.total);
          commit('SET_INVESTIGATIONS_RESULTS_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  fetchOneInvestigationResult({ commit, dispatch }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/radiology/investigations-results/get/${payload.id}`)
        .then(async (response) => {
          commit('SET_INVESTIGATION_RESULT', response.data.data);

          // Fetch images for each result if they exist
          if (response.data.data?.results) {
            for (const result of response.data.data.results) {
              if (result.id) {
                try {
                  await dispatch('fetchInvestigationImages', result.id);
                } catch (error) {
                  console.error(`Failed to fetch images for result ${result.id}:`, error);
                }
              }
            }
          }

          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  /**
   * INVESTIGATION PRESCRIPTION
   */
  fetchOneInvestigationPrescription({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/radiology/investigation-prescription/get/${payload.id}`)
        .then((response) => {
          commit('SET_INVESTIGATION_PRESCRIPTION', response.data.data);
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  changeBulkInvestigationResultsStatus({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .patch(`/radiology/investigation-results/bulk-update/${payload.id}`, {
          selectedInvestigations: payload.selectedInvestigations,
        })
        .then((response) => {
          commit('SET_UPDATED_INVESTIGATIONS_RESULTS', response.data.data);
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  /***
   * SELECTED INVESTIGATIONS
   */
  addSelectedInvestigations({ commit }, investigation) {
    commit('ADD_SELECTED_INVESTIGATION', investigation);
  },

  removeSelectedInvestigation({ commit }, investigation) {
    commit('REMOVE_SELECTED_INVESTIGATION', investigation);
  },

  removeAllSelectedInvestigations({ commit }) {
    commit('EMPTY_SELECTED_INVESTIGATIONS', []);
  },

  /***
   * INVESTIGATION IMAGES (Phase 5)
   */

  /**
   * Upload multiple investigation images
   */
  uploadInvestigationImages({ commit }, { files, resultId }) {
    return new Promise((resolve, reject) => {
      const formData = new FormData();

      // Add all files to FormData
      files.forEach((file, index) => {
        formData.append('images', file);
        // Set initial upload progress
        commit('SET_UPLOAD_PROGRESS', { fileId: `${resultId}-${index}`, progress: 0 });
      });

      // Clear previous errors
      commit('CLEAR_IMAGE_UPLOAD_ERRORS');

      axios
        .post(`/radiology/investigation-images/upload/${resultId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            // Update progress for all files (simplified - in production might track individually)
            files.forEach((file, index) => {
              commit('SET_UPLOAD_PROGRESS', {
                fileId: `${resultId}-${index}`,
                progress: percentCompleted,
              });
            });
          },
        })
        .then((response) => {
          // Add uploaded images to state
          if (response.data.success && response.data.data) {
            response.data.data.forEach((image) => {
              commit('ADD_INVESTIGATION_IMAGE', image);
            });
          }
          // Clear upload progress after successful upload
          commit('CLEAR_UPLOAD_PROGRESS');
          resolve(response);
        })
        .catch((error) => {
          commit('SET_IMAGE_UPLOAD_ERROR', {
            message: error.response?.data?.message || 'Upload failed',
            timestamp: new Date(),
          });
          commit('CLEAR_UPLOAD_PROGRESS');
          reject(error);
        });
    });
  },

  /**
   * Fetch all images for an investigation result
   */
  fetchInvestigationImages({ commit }, resultId) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/radiology/investigation-images/${resultId}`)
        .then((response) => {
          if (response.data.success) {
            commit('SET_CURRENT_INVESTIGATION_IMAGES', response.data.data);
          }
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  /**
   * Delete an investigation image
   */
  deleteInvestigationImage({ commit }, imageId) {
    return new Promise((resolve, reject) => {
      axios
        .delete(`/radiology/investigation-images/${imageId}`)
        .then((response) => {
          if (response.data.success) {
            commit('REMOVE_INVESTIGATION_IMAGE', imageId);
          }
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  /**
   * Set an image as primary
   */
  setAsPrimaryImage({ commit }, imageId) {
    return new Promise((resolve, reject) => {
      axios
        .patch(`/radiology/investigation-images/${imageId}/primary`)
        .then((response) => {
          if (response.data.success) {
            commit('SET_PRIMARY_IMAGE', imageId);
          }
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  /**
   * Update image display order
   */
  updateImageOrder({ commit }, { imageId, order }) {
    return new Promise((resolve, reject) => {
      axios
        .patch(`/radiology/investigation-images/${imageId}`, { display_order: order })
        .then((response) => {
          if (response.data.success) {
            commit('UPDATE_IMAGE_ORDER', { imageId, displayOrder: order });
          }
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  /**
   * Reorder multiple images at once
   */
  reorderInvestigationImages({ commit }, { resultId, imageOrders }) {
    return new Promise((resolve, reject) => {
      axios
        .patch(`/radiology/investigation-images/${resultId}/reorder`, { imageOrders })
        .then((response) => {
          if (response.data.success) {
            // Update each image order in state
            imageOrders.forEach(({ imageId, order }) => {
              commit('UPDATE_IMAGE_ORDER', { imageId, displayOrder: order });
            });
          }
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  /**
   * Update image metadata
   */
  updateInvestigationImageMetadata({ commit }, { imageId, metadata }) {
    return new Promise((resolve, reject) => {
      axios
        .patch(`/radiology/investigation-images/${imageId}`, metadata)
        .then((response) => {
          if (response.data.success) {
            commit('UPDATE_INVESTIGATION_IMAGE', response.data.data);
          }
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  /**
   * Download an investigation image
   */
  downloadInvestigationImage(_, imageId) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/radiology/investigation-images/download/${imageId}`, {
          responseType: 'blob',
        })
        .then((response) => {
          // Create blob link to download
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          // Extract filename from content-disposition header or use default
          const contentDisposition = response.headers['content-disposition'];
          let filename = `image-${imageId}`;
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
            if (filenameMatch) {
              filename = filenameMatch[1];
            }
          }
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  /**
   * Fetch DICOM metadata for an image
   */
  fetchDicomMetadata({ commit }, imageId) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/radiology/investigation-images/image/${imageId}`)
        .then((response) => {
          if (response.data.success && response.data.data.dicom_metadata) {
            const metadata =
              typeof response.data.data.dicom_metadata === 'string'
                ? JSON.parse(response.data.data.dicom_metadata)
                : response.data.data.dicom_metadata;
            commit('SET_DICOM_METADATA', metadata);
          }
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  /**
   * Get image statistics for a result
   */
  fetchInvestigationImageStats(_, resultId) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/radiology/investigation-images/${resultId}/stats`)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  /**
   * Get only DICOM images for a result
   */
  fetchDicomImages(_, resultId) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/radiology/investigation-images/${resultId}/dicom`)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  /**
   * Clear investigation images from state
   */
  clearInvestigationImages({ commit }) {
    commit('CLEAR_INVESTIGATION_IMAGES');
  },
};
