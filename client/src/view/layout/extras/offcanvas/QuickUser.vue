<template>
  <div class="topbar-item">
    <div
      id="kt_quick_user_toggle"
      class="btn btn-icon btn-hover-transparent-white d-flex align-items-center btn-lg px-md-2 w-md-auto"
    >
      <div class="d-flex flex-column text-right pr-3">
        <span class="text-white opacity-50 font-weight-bold font-size-sm d-none d-md-inline">{{
          user.fullname
        }}</span>
        <span class="text-white font-weight-bolder font-size-sm d-none d-md-inline"
          >{{ user.role }} {{ user?.sub_role ? `(${user.sub_role})` : '' }}</span
        >
      </div>
      <span class="symbol symbol-35">
        <span class="symbol-label font-size-h5 font-weight-bold text-white bg-white-o-30">{{
          firstChar
        }}</span>
      </span>
    </div>

    <div id="kt_quick_user" ref="kt_quick_user" class="offcanvas offcanvas-right p-10">
      <!--begin::Header-->
      <div class="offcanvas-header d-flex align-items-center justify-content-between pb-5">
        <h3 class="font-weight-bold m-0">
          Account
        </h3>
        <a
          href="#"
          class="btn btn-xs btn-icon btn-light btn-hover-primary"
          id="kt_quick_user_close"
        >
          <i class="ki ki-close icon-xs text-muted"></i>
        </a>
      </div>
      <!--end::Header-->

      <!--begin::Content-->
      <perfect-scrollbar
        class="offcanvas-content pr-5 mr-n5 scroll"
        style="max-height: 90vh; position: relative;"
      >
        <!--begin::Header-->
        <div class="d-flex align-items-center mt-5">
          <div class="symbol symbol-primary symbol-100 mr-5">
            <img
              v-if="!imageError"
              alt="Pic"
              class="symbol-label"
              :src="imageUrl(user.photo)"
              @load="handleImageLoad"
              @error="handleImageError"
            />
            <span v-else class="symbol-label font-size-h1">
              {{ user?.firstname?.charAt(0)?.toUpperCase() }}
              {{ user?.lastname?.charAt(0)?.toUpperCase() }}
            </span>
            <i class="symbol-badge bg-success"></i>
          </div>
          <div class="d-flex flex-column">
            <a href="#" class="font-weight-bold font-size-h5 text-dark-75 text-hover-primary">
              {{ user.fullname }}
            </a>
            <div class="text-muted mt-1">{{ user.role }}</div>
            <div class="navi mt-2">
              <a href="#" class="navi-item">
                <span class="navi-link p-0 pb-2">
                  <span class="navi-icon mr-1">
                    <span class="svg-icon svg-icon-lg svg-icon-primary">
                      <mail-icon />
                      <!--begin::Svg Icon-->
<!--                      <inline-svg src="/media/svg/icons/Communication/Mail-notification.svg" />-->
                      <!--end::Svg Icon-->
                    </span>
                  </span>
                  <span class="navi-text text-muted text-hover-primary">
                    {{ user.email }}
                  </span>
                </span>
              </a>
            </div>
            <button class="btn btn-light-primary btn-bold" @click="onLogout">
              Sign out
            </button>
          </div>
        </div>
        <!--end::Header-->
        <div class="separator separator-dashed mt-8 mb-5"></div>
        <!--begin::Nav-->
        <div class="navi navi-spacer-x-0 p-0">
          <!--begin::Item-->
          <router-link to="/builder" @click.native="closeOffcanvas" href="#" class="navi-item">
            <div class="navi-link">
              <div class="symbol symbol-40 bg-light mr-3">
                <div class="symbol-label">
                  <span class="svg-icon svg-icon-md svg-icon-success">
                    <!--begin::Svg Icon-->
                    <notification2 />
                    <!--end::Svg Icon-->
                  </span>
                </div>
              </div>
              <div class="navi-text">
                <div class="font-weight-bold">My Profile</div>
                <div class="text-muted">
                  Account settings and more
                </div>
              </div>
            </div>
          </router-link>
          <!--end:Item-->
          <!--begin::Item-->
          <!--          <router-link to="/builder" @click.native="closeOffcanvas" href="#" class="navi-item">-->
          <!--            <div class="navi-link">-->
          <!--              <div class="symbol symbol-40 bg-light mr-3">-->
          <!--                <div class="symbol-label">-->
          <!--                  <span class="svg-icon svg-icon-md svg-icon-warning">-->
          <!--                    &lt;!&ndash;begin::Svg Icon&ndash;&gt;-->
          <!--                    <inline-svg src="media/svg/icons/Shopping/Chart-bar1.svg" />-->
          <!--                    &lt;!&ndash;end::Svg Icon&ndash;&gt;-->
          <!--                  </span>-->
          <!--                </div>-->
          <!--              </div>-->
          <!--              <div class="navi-text">-->
          <!--                <div class="font-weight-bold">My Messages</div>-->
          <!--                <div class="text-muted">Inbox and tasks</div>-->
          <!--              </div>-->
          <!--            </div>-->
          <!--          </router-link>-->
          <!--          &lt;!&ndash;end:Item&ndash;&gt;-->
          <!--          &lt;!&ndash;begin::Item&ndash;&gt;-->
          <!--          <router-link to="/builder" @click.native="closeOffcanvas" href="#" class="navi-item">-->
          <!--            <div class="navi-link">-->
          <!--              <div class="symbol symbol-40 bg-light mr-3">-->
          <!--                <div class="symbol-label">-->
          <!--                  <span class="svg-icon svg-icon-md svg-icon-danger">-->
          <!--                    &lt;!&ndash;begin::Svg Icon&ndash;&gt;-->
          <!--                    <inline-svg src="media/svg/icons/Files/Selected-file.svg" />-->
          <!--                    &lt;!&ndash;end::Svg Icon&ndash;&gt;-->
          <!--                  </span>-->
          <!--                </div>-->
          <!--              </div>-->
          <!--              <div class="navi-text">-->
          <!--                <div class="font-weight-bold">My Activities</div>-->
          <!--                <div class="text-muted">Logs and notifications</div>-->
          <!--              </div>-->
          <!--            </div>-->
          <!--          </router-link>-->
          <!--          &lt;!&ndash;end:Item&ndash;&gt;-->
          <!--          &lt;!&ndash;begin::Item&ndash;&gt;-->
          <!--          <router-link to="/builder" @click.native="closeOffcanvas" href="#" class="navi-item">-->
          <!--            <div class="navi-link">-->
          <!--              <div class="symbol symbol-40 bg-light mr-3">-->
          <!--                <div class="symbol-label">-->
          <!--                  <span class="svg-icon svg-icon-md svg-icon-primary">-->
          <!--                    &lt;!&ndash;begin::Svg Icon&ndash;&gt;-->
          <!--                    <inline-svg src="media/svg/icons/Communication/Mail-opened.svg" />-->
          <!--                    &lt;!&ndash;end::Svg Icon&ndash;&gt;-->
          <!--                  </span>-->
          <!--                </div>-->
          <!--              </div>-->
          <!--              <div class="navi-text">-->
          <!--                <div class="font-weight-bold">My Tasks</div>-->
          <!--                <div class="text-muted">latest tasks and projects</div>-->
          <!--              </div>-->
          <!--            </div>-->
          <!--          </router-link>-->
          <!--end:Item-->
        </div>
        <!--end::Nav-->
        <div class="separator separator-dashed my-7"></div>
        <!--begin::Notifications-->
        <!--        <div>-->
        <!--          &lt;!&ndash;begin:Heading&ndash;&gt;-->
        <!--          <h5 class="mb-5">Recent Notifications</h5>-->
        <!--          &lt;!&ndash;end:Heading&ndash;&gt;-->
        <!--          <template v-for="(item, i) in list">-->
        <!--            &lt;!&ndash;begin::Item &ndash;&gt;-->
        <!--            <div-->
        <!--              class="d-flex align-items-center rounded p-5 gutter-b"-->
        <!--              v-bind:class="`bg-light-${item.type}`"-->
        <!--              v-bind:key="i"-->
        <!--            >-->
        <!--              <span class="svg-icon mr-5" v-bind:class="`svg-icon-${item.type}`">-->
        <!--                <span class="svg-icon svg-icon-lg">-->
        <!--                  &lt;!&ndash;begin::Svg Icon&ndash;&gt;-->
        <!--                  <inline-svg :src="item.svg" />-->
        <!--                  &lt;!&ndash;end::Svg Icon&ndash;&gt;-->
        <!--                </span>-->
        <!--              </span>-->
        <!--              <div class="d-flex flex-column flex-grow-1 mr-2">-->
        <!--                <a-->
        <!--                  href="#"-->
        <!--                  class="font-weight-normal text-dark-75 text-hover-primary font-size-lg mb-1"-->
        <!--                >-->
        <!--                  {{ item.title }}-->
        <!--                </a>-->
        <!--                <span class="text-muted font-size-sm">-->
        <!--                  {{ item.desc }}-->
        <!--                </span>-->
        <!--              </div>-->
        <!--              <span class="font-weight-bolder py-1 font-size-lg" v-bind:class="`text-${item.type}`">-->
        <!--                {{ item.alt }}-->
        <!--              </span>-->
        <!--            </div>-->
        <!--            &lt;!&ndash;end::Item &ndash;&gt;-->
        <!--          </template>-->
        <!--        </div>-->
        <!--end::Notifications-->
      </perfect-scrollbar>
      <!--end::Content-->
    </div>
  </div>
</template>

<style lang="scss" scoped>
#kt_quick_user {
  overflow: hidden;
}
</style>

<script>
import KTLayoutQuickUser from '@/assets/js/layout/extended/quick-user.js';
import KTOffcanvas from '@/assets/js/components/offcanvas.js';
import { parseJwt } from '../../../../core/plugins/parseJwt';
import MailIcon from '@/assets/icons/MailIcon.vue';
import Notification2 from '@/assets/icons/Notification2.vue';
export default {
  name: 'KTQuickUser',
  components: { Notification2, MailIcon },
  data() {
    return {
      list: [
        {
          title: 'Another purpose persuade',
          desc: 'Due in 2 Days',
          alt: '+28%',
          svg: 'media/svg/icons/Home/Library.svg',
          type: 'warning',
        },
        {
          title: 'Would be to people',
          desc: 'Due in 2 Days',
          alt: '+50%',
          svg: 'media/svg/icons/Communication/Write.svg',
          type: 'success',
        },
        {
          title: 'Purpose would be to persuade',
          desc: 'Due in 2 Days',
          alt: '-27%',
          svg: 'media/svg/icons/Communication/Group-chat.svg',
          type: 'danger',
        },
        {
          title: 'The best product',
          desc: 'Due in 2 Days',
          alt: '+8%',
          svg: 'media/svg/icons/General/Attachment2.svg',
          type: 'info',
        },
      ],
      user: '',
      firstChar: '',
      imageError: false,
    };
  },
  mounted() {
    this.user = parseJwt(localStorage.getItem('user_token'));
    this.firstChar = this.user.firstname.charAt(0).toUpperCase();
    // Init Quick User Panel
    KTLayoutQuickUser.init(this.$refs['kt_quick_user']);
  },
  methods: {
    onLogout() {
      this.$store.dispatch('auth/logout').then(() => this.$router.push('/auth/login'));
    },
    closeOffcanvas() {
      new KTOffcanvas(KTLayoutQuickUser.getElement()).hide();
    },

    imageUrl(url) {
      return `${window.location.origin}/static/images/${url}`;
    },

    handleImageLoad() {
      this.imageError = false;
    },

    handleImageError() {
      this.imageError = true;
    },
  },
};
</script>
