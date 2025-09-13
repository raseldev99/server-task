<template>
  <div class="p-6 max-w-6xl mx-auto">
    <div class="grid md:grid-cols-2 gap-6">
      <!-- Edit Profile Form -->
      <Card class="h-fit">
        <template #title>
          <h3 class="text-xl font-semibold text-gray-800">Edit Profile</h3>
        </template>
        <template #content>
          <Form
              id="profileForm"
              :initial-values="profileForm"
              :validation-schema="profileValidationSchema"
              @submit="updateProfile"
          >
            <div class="space-y-4">
              <!-- Name -->
              <div class="field">
                <label for="name" class="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <Field name="name" v-slot="{ field, errorMessage }">
                  <InputText
                      id="name"
                      v-bind="field"
                      v-model="profileForm.name"
                      class="w-full"
                      placeholder="Enter your name"
                      :invalid="!!errorMessage"
                  />
                </Field>
                <ErrorMessage name="name" class="p-error text-xs mt-1 block" />
              </div>

              <!-- Email (readonly) -->
              <div class="field">
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <InputText
                    id="email"
                    v-model="profileForm.email"
                    class="w-full"
                    disabled
                    placeholder="Email address"
                />
                <small class="text-gray-500 text-xs mt-1 block">Email cannot be changed</small>
              </div>

              <!-- Submit -->
              <Button
                  label="Update Profile"
                  type="submit"
                  class="w-full mt-6"
                  :loading="profileLoading"
              />
            </div>
          </Form>
        </template>
      </Card>

      <!-- Change Password Form -->
      <Card class="h-fit">
        <template #title>
          <h3 class="text-xl font-semibold text-gray-800">Change Password</h3>
        </template>
        <template #content>
          <Form
              id="passwordForm"
              :initial-values="passwordForm"
              :validation-schema="passwordValidationSchema"
              @submit="changePassword"
          >
            <div class="space-y-4">
              <!-- Current Password -->
              <div class="field">
                <label for="current_password" class="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <Field name="current_password" v-slot="{ field, errorMessage }">
                  <Password
                      id="current_password"
                      v-bind="field"
                      v-model="passwordForm.current_password"
                      class="w-full"
                      toggleMask
                      placeholder="Enter current password"
                      :invalid="!!errorMessage"
                      :feedback="false"
                  />
                </Field>
                <ErrorMessage name="current_password" class="p-error text-xs mt-1 block" />
              </div>

              <!-- New Password -->
              <div class="field">
                <label for="new_password" class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <Field name="new_password" v-slot="{ field, errorMessage }">
                  <Password
                      id="new_password"
                      v-bind="field"
                      v-model="passwordForm.new_password"
                      class="w-full"
                      toggleMask
                      placeholder="Enter new password"
                      :invalid="!!errorMessage"
                      :feedback="false"
                  />
                </Field>
                <ErrorMessage name="new_password" class="p-error text-xs mt-1 block" />
              </div>

              <!-- Confirm Password -->
              <div class="field">
                <label for="new_password_confirmation" class="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <Field name="new_password_confirmation" v-slot="{ field, errorMessage }">
                  <Password
                      id="new_password_confirmation"
                      v-bind="field"
                      v-model="passwordForm.new_password_confirmation"
                      class="w-full"
                      toggleMask
                      placeholder="Confirm new password"
                      :invalid="!!errorMessage"
                      :feedback="false"
                  />
                </Field>
                <ErrorMessage name="new_password_confirmation" class="p-error text-xs mt-1 block" />
              </div>

              <!-- Submit -->
              <Button
                  label="Change Password"
                  type="submit"
                  severity="secondary"
                  class="w-full mt-6"
                  :loading="passwordLoading"
              />
            </div>
          </Form>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import Card from "primevue/card";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import { useToast } from 'primevue/usetoast';
import {useAuthStore} from "@/stores/authStore.js";

const toast = useToast();
const authStore = useAuthStore()

// Initial form values
const profileForm = ref({
  name: authStore.user?.name,
  email: authStore.user?.email,
});


const passwordForm = ref({
  current_password: "",
  new_password: "",
  new_password_confirmation: "",
});

// Validation Schemas
const profileValidationSchema = yup.object({
  name: yup.string().required("Name is required").min(3, "Name must be at least 3 characters"),
  email: yup.string().email().required(), // disabled but still validated
});

const passwordValidationSchema = yup.object({
  current_password: yup.string().required("Current password is required").min(6, "At least 6 characters"),
  new_password: yup.string().required("New password is required").min(6, "At least 6 characters"),
  new_password_confirmation: yup.string()
      .oneOf([yup.ref("new_password")], "Passwords do not match")
      .required("Confirm password is required"),
});

// Loading states
const profileLoading = ref(false);
const passwordLoading = ref(false);

// Methods
const updateProfile = async (values,actions) => {
  profileLoading.value = true;
  try {
    await new authStore.updateProfile(values);
    toast.add({ severity:'success', summary:'Success', detail:'Profile update successfully.', life: 3000 });
  } catch (err) {
    if (err.status === 422 && actions) {
      actions.setErrors(err.response?.data?.errors || {});
    }else {
      toast.add({ severity:'error', summary:'Error', detail:'Fail to update profile!', life: 3000 });
    }
  } finally {
    profileLoading.value = false;
  }
};

const changePassword = async (values,actions) => {
  passwordLoading.value = true;
  try {
    await new authStore.changePassword(values);
    passwordForm.value = { current_password: "", new_password: "", new_password_confirmation: "" };
    toast.add({ severity:'success', summary:'Success', detail:'Password change success', life: 3000 });
  } catch (err) {
    if (err.status === 422 && actions) {
      actions.setErrors(err.response?.data?.errors || {});
    }else {
      toast.add({ severity:'error', summary:'Error', detail:'Fail to change password!', life: 3000 });
    }
  } finally {
    passwordLoading.value = false;
  }
};
</script>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
}

.p-card .p-card-content {
  padding: 1.5rem;
}

.p-inputtext:disabled {
  background-color: #f9fafb;
  opacity: 0.6;
}

:deep(.p-password) {
  width: 100%;
}

:deep(.p-password .p-inputtext) {
  width: 100%;
}
:deep(.p-error.text-xs) {
  color: #ef4444 !important;
}

</style>
