<template>
  <div>
    <component :is="currentRole" />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import auditordev from "./auditor";
import studentdev from "./student";
export default {
  components: { auditordev, studentdev },
  data() {
    return {
      currentRole: "studentdev"
    };
  },
  computed: {
    ...mapGetters(["roles"])
  },
  created() {
    if (!this.roles.includes("normal")) {
      this.currentRole = "auditordev";
    }
  }
};
</script>
