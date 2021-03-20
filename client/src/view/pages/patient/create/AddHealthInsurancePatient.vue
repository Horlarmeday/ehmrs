<template>
  <div>
    <!--begin::Accordion-->
    <div
      class="accordion accordion-solid accordion-panel accordion-svg-toggle"
      id="accordionExample8"
      role="tablist"
    >
      <!-- Personal Info -->
      <div class="card">
        <div class="card-header" header-tag="header" role="tab">
          <div class="card-title" v-b-toggle.accordion-1>
            <div class="card-label">Personal Details</div>
            <div class="card-label">{{ health_type }}</div>
            <accordion-icon />
          </div>
        </div>
        <b-collapse
          id="accordion-1"
          visible
          accordion="my-accordion"
          role="tabpanel"
        >
          <div class="card-body">
            <div class="pt-6">
              <img
                src="/media/users/blank.png"
                v-if="!videoShowing && !image"
                width="160"
              />
              <video
                ref="video"
                id="video"
                v-show="!image"
                style="height:1px;width:120px;margin-bottom:20px;"
                autoplay
              ></video>
              <canvas
                ref="canvas"
                id="canvas"
                width="250"
                height="187"
                v-show="image"
              >
              </canvas>
              <button
                id="snap"
                v-if="!image && !photoSaved && !videoShowing"
                class="btn btn-success btn-sm mt-4"
                style="display: block;"
                v-on:click="startCamera()"
              >
                Take Photo
              </button>
              <button
                id="snap"
                v-if="!image && !photoSaved && videoShowing"
                class="btn btn-success btn-sm"
                style="display: block;"
                v-on:click="capture()"
              >
                Snap Photo
              </button>
              <div class="row" v-if="!photoLoading" style="padding-top: 15px">
                <div class="ml-5">
                  <button
                    id="snap"
                    v-if="image && !photoSaved"
                    class="btn btn-primary btn-sm"
                    v-on:click="snapAgain()"
                  >
                    Snap Again
                  </button>
                </div>
              </div>
            </div>

            <hr />
            <!-- NAME -->
            <div class="form-group row">
              <div class="col-lg-4">
                <label>First Name <span class="text-danger">*</span></label>
                <input
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  type="text"
                  class="form-control form-control-sm"
                  v-model="firstname"
                  placeholder="First Name"
                  name="firstname"
                />
                <span class="text-danger text-sm">{{
                  errors.first("firstname")
                }}</span>
              </div>
              <div class="col-lg-4">
                <label>Middle Name</label>
                <input
                  type="text"
                  class="form-control form-control-sm"
                  v-model="middlename"
                  placeholder="Middle Name"
                  name="middlename"
                />
                <span class="text-danger text-sm">{{
                  errors.first("middlename")
                }}</span>
              </div>
              <div class="col-lg-4">
                <label>Last Name <span class="text-danger">*</span></label>
                <input
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  type="text"
                  class="form-control form-control-sm"
                  v-model="lastname"
                  placeholder="Last Name"
                  name="lastname"
                />
                <span class="text-danger text-sm">{{
                  errors.first("lastname")
                }}</span>
              </div>
            </div>
            <!-- Contact -->
            <div class="form-group row">
              <div class="col-lg-4">
                <label>Email</label>
                <input
                  type="email"
                  class="form-control form-control-sm"
                  name="email"
                  placeholder="Enter email"
                  v-model="email"
                />
                <span class="text-danger text-sm">{{
                  errors.first("email")
                }}</span>
              </div>
              <div class="col-lg-4">
                <label>Phone Number <span class="text-danger">*</span></label>
                <input
                  v-validate="'required|min:11|max:11'"
                  data-vv-validate-on="blur"
                  maxlength="11"
                  type="text"
                  class="form-control form-control-sm"
                  v-model="phone"
                  placeholder="Phone Number"
                  name="phone"
                />
                <span class="text-danger text-sm">{{
                  errors.first("phone")
                }}</span>
              </div>
              <div class="col-lg-4">
                <label>Religion <span class="text-danger">*</span></label>
                <select
                  v-model="religion"
                  class="form-control form-control-sm"
                  name="religion"
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                >
                  <option value="Islam">Islam</option>
                  <option value="Christianity">Christianity</option>
                  <option value="Traditional">Traditional</option>
                  <option value="Other">Other</option>
                </select>
                <span class="text-danger text-sm">{{
                  errors.first("religion")
                }}</span>
              </div>
            </div>
            <div class="form-group row">
              <div class="col-lg-4">
                <label>Date of Birth <span class="text-danger">*</span></label>
                <datepicker
                  name="date_of_birth"
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  v-model="date_of_birth"
                  input-class="form-control form-control-sm"
                  placeholder="Date of Birth"
                ></datepicker>
                <span class="text-danger text-sm">{{
                  errors.first("date_of_birth")
                }}</span>
              </div>
              <div class="col-lg-4">
                <label>Gender <span class="text-danger">*</span></label>
                <select
                  class="form-control form-control-sm"
                  v-model="gender"
                  name="gender"
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <span class="text-danger text-sm">{{
                  errors.first("gender")
                }}</span>
              </div>
              <div class="col-lg-4">
                <label>Marital Status <span class="text-danger">*</span></label>
                <select
                  class="form-control form-control-sm"
                  v-model="marital_status"
                  name="marital_status"
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                >
                  <option value="Married">Married </option>
                  <option value="Single">Single</option>
                  <option value="Widow">Widow</option>
                  <option value="Widower">Widower</option>
                  <option value="Divorced">Divorced</option>
                </select>
                <span class="text-danger text-sm">{{
                  errors.first("marital_status")
                }}</span>
              </div>
            </div>
            <div class="form-group row">
              <div class="col-lg-4">
                <label>Country <span class="text-danger">*</span></label>
                <select
                  class="form-control form-control-sm"
                  v-model="country"
                  name="country"
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  @change="getStates"
                >
                  <option
                    v-for="country in countries"
                    :key="country.id"
                    :value="{ id: country.id, text: country.name }"
                    >{{ country.name }}
                  </option>
                </select>
                <span class="text-danger text-sm">{{
                  errors.first("country")
                }}</span>
              </div>
              <div class="col-lg-4">
                <label>States <span class="text-danger">*</span></label>
                <select
                  class="form-control form-control-sm"
                  v-model="state"
                  name="state"
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  @change="getCities"
                >
                  <option
                    v-for="state in states"
                    :key="state.id"
                    :value="{ id: state.id, text: state.name }"
                    >{{ state.name }}
                  </option>
                </select>
                <span class="text-danger text-sm">{{
                  errors.first("state")
                }}</span>
              </div>
              <div class="col-lg-4">
                <label
                  >Local Government <span class="text-danger">*</span></label
                >
                <select
                  class="form-control form-control-sm"
                  v-model="lga"
                  name="lga"
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                >
                  <option
                    v-for="city in cities"
                    :key="city.id"
                    :value="{ id: city.id, text: city.name }"
                    >{{ city.name }}
                  </option>
                </select>
                <span class="text-danger text-sm">{{
                  errors.first("lga")
                }}</span>
              </div>
            </div>
            <div class="form-group row">
              <div class="col-lg-4">
                <label>Home Address <span class="text-danger">*</span></label>
                <input
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  type="text"
                  class="form-control form-control-sm"
                  v-model="address"
                  placeholder="Home Address"
                  name="address"
                />
                <span class="text-danger text-sm">{{
                  errors.first("address")
                }}</span>
              </div>
              <div class="col-lg-4">
                <label>Occupation <span class="text-danger">*</span></label>
                <input
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  type="text"
                  class="form-control form-control-sm"
                  v-model="occupation"
                  placeholder="Occupation"
                  name="occupation"
                />
                <span class="text-danger text-sm">{{
                  errors.first("occupation")
                }}</span>
              </div>
              <div class="col-lg-4">
                <label>Alternate Phone Number</label>
                <input
                  type="text"
                  class="form-control form-control-sm"
                  v-model="alt_phone"
                  maxlength="11"
                  placeholder="Alternate Phone"
                />
              </div>
            </div>
            <div class="form-group row">
              <div class="col-lg-4">
                <label
                  >Next of Kin Name <span class="text-danger">*</span></label
                >
                <input
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  type="text"
                  class="form-control form-control-sm"
                  v-model="next_of_kin_name"
                  placeholder="Name"
                  name="next_of_kin_name"
                />
                <span class="text-danger text-sm">{{
                  errors.first("next_of_kin_name")
                }}</span>
              </div>
              <div class="col-lg-4">
                <label
                  >Next of Kin Address <span class="text-danger">*</span></label
                >
                <input
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  type="text"
                  class="form-control form-control-sm"
                  v-model="next_of_kin_address"
                  placeholder="Address"
                  name="next_of_kin_address"
                />
                <span class="text-danger text-sm">{{
                  errors.first("next_of_kin_address")
                }}</span>
              </div>
              <div class="col-lg-4">
                <label
                  >Next of Kin Phone <span class="text-danger">*</span></label
                >
                <input
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  type="text"
                  class="form-control form-control-sm"
                  v-model="next_of_kin_phone"
                  placeholder="Phone"
                  name="next_of_kin_phone"
                />
                <span class="text-danger text-sm">{{
                  errors.first("next_of_kin_phone")
                }}</span>
              </div>
              <div class="col-lg-4">
                <label>Relationship <span class="text-danger">*</span></label>
                <select
                  class="form-control form-control-sm"
                  v-model="relationship"
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  name="relationship"
                >
                  <option disabled selected>Select</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Wife">Wife</option>
                  <option value="Husband">Husband</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Uncle">Uncle</option>
                  <option value="Aunt">Aunt</option>
                </select>
                <span class="text-danger text-sm">{{
                  errors.first("relationship")
                }}</span>
              </div>
            </div>
            <h6 class=" mt-4 text-primary">Health insurance</h6>
            <div class="form-group row">
              <div class="col-lg-4">
                <label>HMO <span class="text-danger">*</span></label>
                <v-select
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  name="hmo_id"
                  v-model="hmo_id"
                  label="name"
                  :reduce="hmos => hmos.id"
                  :options="hmos"
                ></v-select>
                <span class="text-danger text-sm">{{
                  errors.first("hmo_id")
                }}</span>
              </div>
              <div class="col-lg-4">
                <label>Policy Number <span class="text-danger">*</span></label>
                <input
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  type="text"
                  class="form-control form-control-sm"
                  v-model="enrollee_id"
                  placeholder="Policy Number"
                  name="enrollee_id"
                />
                <span class="text-danger text-sm">{{
                  errors.first("enrollee_id")
                }}</span>
              </div>
              <div class="col-lg-4">
                <label>Organization <span class="text-danger">*</span></label>
                <input
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                  type="text"
                  class="form-control form-control-sm"
                  v-model="organization"
                  placeholder="Organization"
                  name="organization"
                />
                <span class="text-danger text-sm">{{
                  errors.first("organization")
                }}</span>
              </div>
              <div class="col-lg-4">
                <label>Plan <span class="text-danger">*</span></label>
                <select
                  class="form-control form-control-sm"
                  v-model="plan"
                  name="plan"
                  v-validate="'required'"
                  data-vv-validate-on="blur"
                >
                  <option value="Social">Social </option>
                  <option value="Gold">Gold</option>
                  <option value="Bronze">Bronze</option>
                  <option value="Silver">Silver</option>
                  <option value="Emerald">Emerald</option>
                </select>
                <span class="text-danger text-sm">{{
                  errors.first("plan")
                }}</span>
              </div>
            </div>
          </div>
        </b-collapse>
      </div>
      <!-- Dependants -->
      <div class="card">
        <div class="card-header" header-tag="header" role="tab">
          <div class="card-title" v-b-toggle.accordion-3>
            <div class="card-label">Dependant Details</div>
            <span class="svg-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                width="24px"
                height="24px"
                viewBox="0 0 24 24"
                version="1.1"
              >
                <g
                  stroke="none"
                  stroke-width="1"
                  fill="none"
                  fill-rule="evenodd"
                >
                  <polygon points="0 0 24 0 24 24 0 24" />
                  <path
                    d="M12.2928955,6.70710318 C11.9023712,6.31657888 11.9023712,5.68341391 12.2928955,5.29288961 C12.6834198,4.90236532 13.3165848,4.90236532 13.7071091,5.29288961 L19.7071091,11.2928896 C20.085688,11.6714686 20.0989336,12.281055 19.7371564,12.675721 L14.2371564,18.675721 C13.863964,19.08284 13.2313966,19.1103429 12.8242777,18.7371505 C12.4171587,18.3639581 12.3896557,17.7313908 12.7628481,17.3242718 L17.6158645,12.0300721 L12.2928955,6.70710318 Z"
                    fill="#000000"
                    fill-rule="nonzero"
                  />
                  <path
                    d="M3.70710678,15.7071068 C3.31658249,16.0976311 2.68341751,16.0976311 2.29289322,15.7071068 C1.90236893,15.3165825 1.90236893,14.6834175 2.29289322,14.2928932 L8.29289322,8.29289322 C8.67147216,7.91431428 9.28105859,7.90106866 9.67572463,8.26284586 L15.6757246,13.7628459 C16.0828436,14.1360383 16.1103465,14.7686056 15.7371541,15.1757246 C15.3639617,15.5828436 14.7313944,15.6103465 14.3242754,15.2371541 L9.03007575,10.3841378 L3.70710678,15.7071068 Z"
                    fill="#000000"
                    fill-rule="nonzero"
                    opacity="0.3"
                    transform="translate(9.000003, 11.999999) rotate(-270.000000) translate(-9.000003, -11.999999) "
                  />
                </g></svg
            ></span>
          </div>
        </div>
        <b-collapse
          id="accordion-3"
          visible
          accordion="my-accordion"
          role="tabpanel"
        >
          <div class="card-body">
            <div class="pt-6">
              <img
                src="/media/users/blank.png"
                v-if="!dvideoShowing && !dependant_image"
                width="160"
              />
              <video
                ref="dependant_video"
                id="dependant_video"
                v-show="!dependant_image"
                style="height:1px;width:120px;margin-bottom:20px;"
                autoplay
              ></video>
              <canvas
                ref="dependant_canvas"
                id="dependant_canvas"
                width="250"
                height="187"
                v-show="dependant_image"
              >
              </canvas>
              <button
                id="snap"
                v-if="!dependant_image && !dphotoSaved && !dvideoShowing"
                class="btn btn-success btn-sm mt-4"
                style="display: block;"
                v-on:click="startDependantCamera()"
              >
                Take Photo
              </button>
              <button
                id="snap"
                v-if="!dependant_image && !dphotoSaved && dvideoShowing"
                class="btn btn-success btn-sm"
                style="display: block;"
                v-on:click="captureDependant()"
              >
                Snap Photo
              </button>
              <div class="row" v-if="!dphotoLoading" style="padding-top: 15px">
                <div class="ml-5">
                  <button
                    id="snap"
                    v-if="dependant_image && !dphotoSaved"
                    class="btn btn-primary btn-sm"
                    v-on:click="snapDependantAgain()"
                  >
                    Snap Again
                  </button>
                </div>
              </div>
            </div>

            <hr />
            <!-- NAME -->
            <div class="form-group row">
              <div class="col-lg-4">
                <label>First Name <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control form-control-sm"
                  v-model="dependant_firstname"
                  placeholder="First Name"
                />
              </div>
              <div class="col-lg-4">
                <label>Last Name <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control form-control-sm"
                  v-model="dependant_lastname"
                  placeholder="Last Name"
                  name="dependant_lastname"
                />
              </div>
              <div class="col-lg-4">
                <label>Phone Number <span class="text-danger">*</span></label>
                <input
                  maxlength="11"
                  type="text"
                  class="form-control form-control-sm"
                  v-model="dependant_phone"
                  placeholder="Phone Number"
                  name="dependant_phone"
                />
              </div>
            </div>
            <!-- Contact -->
            <div class="form-group row">
              <div class="col-lg-4">
                <label>Date of Birth <span class="text-danger">*</span></label>
                <datepicker
                  data-vv-validate-on="blur"
                  v-model="dependant_date_of_birth"
                  input-class="form-control form-control-sm"
                  placeholder="Date of Birth"
                ></datepicker>
              </div>
              <div class="col-lg-4">
                <label>Gender <span class="text-danger">*</span></label>
                <select
                  class="form-control form-control-sm"
                  v-model="dependant_gender"
                  name="dependant_gender"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div class="col-lg-4">
                <label>Home Address <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control form-control-sm"
                  v-model="dependant_address"
                  placeholder="Home Address"
                  name="dependant_address"
                />
              </div>
            </div>
            <div class="form-group row">
              <div class="col-lg-4">
                <label
                  >Relationship with Principal
                  <span class="text-danger">*</span></label
                >
                <select
                  class="form-control form-control-sm"
                  v-model="dependant_relationship"
                  name="dependant_relationship"
                >
                  <option disabled selected>Select</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Wife">Wife</option>
                  <option value="Husband">Husband</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Uncle">Uncle</option>
                  <option value="Aunt">Aunt</option>
                </select>
              </div>
              <div class="col-lg-4">
                <label>Policy Number <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control form-control-sm"
                  v-model="dependant_enrollee_id"
                  placeholder="Policy Number"
                  name="dependant_enrollee_id"
                />
              </div>
            </div>
            <div>
              <button class="btn btn-light-primary" @click="saveDependant">
                Save
              </button>
            </div>
            <div v-if="dependants.length" class="row">
              <div class="col-lg-12">
                <div class="card card-custom card-stretch gutter-b">
                  <!--begin::Header-->
                  <div class="card-header border-0 py-5">
                    <h3 class="card-title align-items-start flex-column">
                      <span class="card-label font-weight-bolder text-dark"
                        >Dependants</span
                      >
                    </h3>
                  </div>
                  <!--end::Header-->

                  <!--begin::Body-->
                  <div class="card-body pt-0 pb-3">
                    <div class="tab-content">
                      <!--begin::Table-->
                      <div class="table-responsive">
                        <table
                          class="table table-head-custom table-head-bg table-borderless table-vertical-center"
                        >
                          <thead>
                            <tr class="text-left text-uppercase">
                              <th style="min-width: 250px" class="pl-7">
                                <span class="text-dark-75">Name</span>
                              </th>
                              <th style="min-width: 100px">Phone</th>
                              <th style="min-width: 100px">Gender</th>
                              <th style="min-width: 100px">Date of Birth</th>
                              <th style="min-width: 130px">Policy Number</th>
                              <th style="min-width: 80px"></th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-for="(dependant, index) in dependants"
                              :key="index"
                            >
                              <td class="pl-0 py-8">
                                <div class="d-flex align-items-center">
                                  <div
                                    class="symbol symbol-50 symbol-light mr-4"
                                  >
                                    <span class="symbol-label">
                                      <img
                                        :src="dependant.photo"
                                        class="h-75 align-self-end"
                                        alt=""
                                      />
                                    </span>
                                  </div>
                                  <div>
                                    <a
                                      href="#"
                                      class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                                      >{{ dependant.firstname }}
                                      {{ dependant.lastname }}</a
                                    >
                                    <span
                                      class="text-muted font-weight-bold d-block"
                                      >{{ dependant.address }}</span
                                    >
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span
                                  class="text-dark-75 font-weight-bolder d-block font-size-lg"
                                >
                                  {{ dependant.phone }}
                                </span>
                              </td>
                              <td>
                                <span
                                  class="text-dark-75 font-weight-bolder d-block font-size-lg"
                                >
                                  {{ dependant.gender }}
                                </span>
                              </td>
                              <td>
                                <span
                                  class="text-dark-75 font-weight-bolder d-block font-size-lg"
                                >
                                  {{
                                    dependant.date_of_birth
                                      | moment("DD/MM/YYYY")
                                  }}
                                </span>
                              </td>
                              <td>
                                <span
                                  class="text-muted font-weight-bold d-block font-size-sm"
                                >
                                  {{ dependant.enrollee_code }}
                                </span>
                              </td>
                              <td class="">
                                <a href="#" @click="removeDependant"
                                  ><i class="flaticon2-trash text-danger"></i
                                ></a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <!--end::Table-->
                    </div>
                  </div>
                  <!--end::Body-->
                </div>
              </div>
            </div>
          </div>
        </b-collapse>
      </div>
      <!-- Button to create -->
      <div>
        <b-dropdown
          split
          text="Start OPD Visit"
          class="float-right"
          variant="primary"
        >
          <b-dropdown-item href="#">Start IPD Visit</b-dropdown-item>
          <b-dropdown-item href="#">Start Emergency Visit</b-dropdown-item>
        </b-dropdown>
        <button
          ref="kt-sign_up_submit"
          class="btn btn-light-primary font-weight-bold float-right mr-4"
          @click="addPatient"
        >
          Save
        </button>
      </div>
    </div>
    <!--end::Accordion-->
  </div>
</template>

<script>
import Datepicker from "vuejs-datepicker";
import vSelect from "vue-select";
import {
  getCountries,
  getStateById,
  getCityById
} from "../../../../assets/json/index";
import AccordionIcon from "../../../../assets/icons/AccordionIcon";
import Swal from "sweetalert2";
export default {
  components: {
    Datepicker,
    vSelect,
    AccordionIcon
  },
  data() {
    return {
      gender: "",
      firstname: "",
      lastname: "",
      middlename: "",
      religion: "",
      email: "",
      phone: "",
      date_of_birth: "",
      marital_status: "",
      country: "",
      state: "",
      lga: "",
      address: "",
      occupation: "",
      alt_phone: "",
      next_of_kin_name: "",
      next_of_kin_phone: "",
      next_of_kin_address: "",
      hmo_id: "",
      organization: "",
      enrollee_id: "",
      relationship: "",
      plan: "",
      countries: [],
      states: [],
      cities: [],
      health_type: "",

      dependant_firstname: "",
      dependant_lastname: "",
      dependant_phone: "",
      dependant_relationship: "",
      dependant_enrollee_id: "",
      dependant_gender: "",
      dependant_address: "",
      dependant_date_of_birth: "",
      dependant_image: "",
      isDisabled: false,

      dependants: [],
      // principal video
      showFinish: false,
      videoShowing: false,
      photoSaved: false,
      photoLoading: false,
      video: {},
      canvas: {},
      image: "",
      // dependant video
      dshowFinish: false,
      dvideoShowing: false,
      dphotoSaved: false,
      dphotoLoading: false,
      dependantvideo: {},
      dependantcanvas: {}
    };
  },
  created() {
    this.countries = getCountries();
    this.getHMOs(this.$route.params.id);
  },
  computed: {
    hmos() {
      return this.$store.state.insurance.hmos;
    }
  },

  methods: {
    getStates() {
      this.states = getStateById(this.country.id);
    },

    getCities() {
      this.cities = getCityById(this.state.id);
    },

    getHMOs(filter) {
      this.$store.dispatch("insurance/fetchHMOs", {
        currentPage: 1,
        itemsPerPage: 25,
        filter
      });
    },

    // Image Capture
    startCamera() {
      this.toggleVideoShowing();
      this.video = this.$refs.video;
      this.video.style = "display:block;width:250px;margin-bottom:20px;";
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
          this.video.srcObject = stream;
          this.video.play();
        });
      }
    },

    stopStreamedVideo(videoElem) {
      const stream = videoElem.srcObject;
      const tracks = stream.getTracks();

      tracks.forEach(function(track) {
        track.stop();
      });

      videoElem.srcObject = null;
    },

    capture() {
      this.canvas = this.$refs.canvas;
      this.canvas.getContext("2d").drawImage(this.video, 0, 0, 250, 187);
      this.image = this.canvas.toDataURL();
    },

    snapAgain() {
      this.video = this.$refs.video;
      this.video.style = "display:block;width:250px;margin-bottom:20px;";
      this.image = null;
    },

    toggleVideoShowing() {
      this.videoShowing = !this.videoShowing;
    },

    toggleDependantVideoShowing() {
      this.dvideoShowing = !this.dvideoShowing;
    },
    startDependantCamera() {
      this.toggleDependantVideoShowing();
      this.dependantvideo = this.$refs.dependant_video;
      this.dependantvideo.style =
        "display:block;width:250px;margin-bottom:20px;";
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
          this.dependantvideo.srcObject = stream;
          this.dependantvideo.play();
        });
      }
    },

    captureDependant() {
      this.dependantcanvas = this.$refs.dependant_canvas;
      this.dependantcanvas
        .getContext("2d")
        .drawImage(this.dependantvideo, 0, 0, 250, 187);
      this.dependant_image = this.dependantcanvas.toDataURL();
    },

    snapDependantAgain() {
      this.dependantvideo = this.$refs.dependant_video;
      this.dependantvideo.style =
        "display:block;width:250px;margin-bottom:20px;";
      this.dependant_image = null;
    },

    initPatientValues() {
      this.gender = "";
      this.firstname = "";
      this.lastname = "";
      this.middlename = "";
      this.religion = "";
      this.email = "";
      this.phone = "";
      this.date_of_birth = "";
      this.marital_status = "";
      this.country = "";
      this.state = "";
      this.lga = "";
      this.address = "";
      this.occupation = "";
      this.alt_phone = "";
      this.next_of_kin_name = "";
      this.next_of_kin_phone = "";
      this.next_of_kin_address = "";
      this.hmo_id = "";
      this.enrollee_id = "";
      this.organization = "";
      this.plan = "";
      this.insurance_id = "";
      this.relationship = "";
      this.showFinish = false;
      this.videoShowing = false;
      this.photoSaved = false;
      this.photoLoading = false;
      this.video = {};
      this.canvas = {};
      this.image = null;
      this.dependants = [];
    },

    initDependant() {
      this.dependant_firstname = "";
      this.dependant_lastname = "";
      this.dependant_phone = "";
      this.dependant_relationship = "";
      this.dependant_enrollee_id = "";
      this.dependant_gender = "";
      this.dependant_address = "";
      this.dependant_date_of_birth = "";
      this.dependant_image = null;
      this.dshowFinish = false;
      this.dvideoShowing = false;
      this.dphotoSaved = false;
      this.dphotoLoading = false;
      this.dependantvideo = {};
      this.dependantcanvas = {};
    },

    saveDependant() {
      this.dependants.push({
        firstname: this.dependant_firstname,
        lastname: this.dependant_lastname,
        phone: this.dependant_phone,
        relationship: this.dependant_relationship,
        enrollee_code: this.dependant_enrollee_id,
        insurance_id: this.insurance_id,
        hmo_id: this.hmo_id,
        gender: this.dependant_gender,
        address: this.dependant_address,
        plan: this.plan,
        date_of_birth: this.dependant_date_of_birth,
        photo: this.dependant_image
      });
      this.stopStreamedVideo(this.dependantvideo);
      this.initDependant();
    },

    removeDependant(index) {
      this.dependants.splice(index, 1);
    },

    addSpinner(submitButton) {
      this.isDisabled = true;
      submitButton.classList.add("spinner", "spinner-light", "spinner-right");
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove(
        "spinner",
        "spinner-light",
        "spinner-right"
      );
    },

    displayPrompt() {
      Swal.fire({
        title: "Are you sure?",
        text: "Patient does not have any dependant",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Continue!",
        cancelButtonText: "No, cancel!",
        showLoaderOnConfirm: true,
        preConfirm: () => {
          return this.finishAddPatient();
        }
      });
    },

    notifyPhoto() {
      return this.$notify({
        group: "foo",
        title: "Error message",
        text: "Please take photo",
        type: "error"
      });
    },

    addPatient() {
      if (!this.image) return this.notifyPhoto();
      this.$validator.validateAll().then(result => {
        if (result) {
          if (this.dependants.length === 0) return this.displayPrompt();
          this.finishAddPatient();
        }
      });
    },

    finishAddPatient() {
      // set spinner to submit button
      const submitButton = this.$refs["kt-sign_up_submit"];
      this.addSpinner(submitButton);

      const data = {
        gender: this.gender,
        firstname: this.firstname,
        lastname: this.lastname,
        middlename: this.middlename,
        religion: this.religion,
        email: this.email,
        phone: this.phone,
        date_of_birth: this.date_of_birth,
        marital_status: this.marital_status,
        country: this.country.text,
        state: this.state.text,
        lga: this.lga.text,
        address: this.address,
        occupation: this.occupation,
        alt_phone: this.alt_phone,
        next_of_kin_name: this.next_of_kin_name,
        next_of_kin_phone: this.next_of_kin_phone,
        next_of_kin_address: this.next_of_kin_address,
        relationship: this.relationship,
        enrollee_code: this.enrollee_id,
        organization: this.organization,
        hmo_id: this.hmo_id,
        insurance_id: this.insurance_id,
        plan: this.plan,
        photo: this.image,
        dependants: this.dependants
      };

      this.$store
        .dispatch("patient/createHealthInsurancePatient", data)
        .then(() => {
          this.removeSpinner(submitButton);
          this.stopStreamedVideo(this.video);
          this.initPatientValues();
        })
        .catch(() => this.removeSpinner(submitButton));
    }
  }
};
</script>

<style scoped>
.form-group {
  margin-bottom: 0.9rem !important;
}
</style>
