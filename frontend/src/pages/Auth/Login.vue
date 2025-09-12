<script setup>
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { useRouter } from "vue-router";
import Button from 'primevue/button';
import {useAuthStore} from "@/stores/authStore.js";
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const router = useRouter();

const authStore = useAuthStore();

const { errors, handleSubmit, defineField,setErrors } = useForm({
  validationSchema: yup.object({
    email: yup.string().email().required('Email is required'),
    password: yup.string().min(6).required("Password is required"),
  }),
});

// Creates a submission handler
const onSubmit = handleSubmit(async (values) => {
  try {
    await authStore.login(values);
    toast.add({ severity: 'success', summary: 'Success', detail: 'Login successfully.', life: 3000 });
  } catch (error) {
    if (error.status === 422){
      setErrors(error.response.data.errors || {});
    }else if(error.status === 401){
      setErrors({email: error.response?.data?.message || "Something went wrong"});
    }else {
      toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || "Something went wrong", life: 3000 });
    }
  }
});
const [email, emailAttrs] = defineField('email');
const [password, passwordAttrs] = defineField('password');
</script>
<template>
  <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Sign in to your account</h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form class="space-y-6" @submit="onSubmit">
        <div>
          <label for="email" class="block text-sm/6 font-medium text-gray-900">Email address</label>
          <div class="mt-2">
            <input type="email" name="email" id="email" autocomplete="email" v-model="email" v-bind="emailAttrs" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
            <p class="text-red-500 text-sm mt-1">{{ errors.email }}</p>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <label for="password" class="block text-sm/6 font-medium text-gray-900">Password</label>
            <div class="text-sm">
              <a href="#" class="font-semibold text-indigo-600 hover:text-indigo-500">Forgot password?</a>
            </div>
          </div>
          <div class="mt-2">
            <input type="password" name="password" id="password" autocomplete="current-password" v-model="password" v-bind="passwordAttrs" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
            <p class="text-red-500 text-sm mt-1">{{ errors.password }}</p>
          </div>
        </div>

        <div>
          <Button pt:root="flex w-full justify-center !py-1.5" type="submit" label="Sign in" :loading="authStore.loading" />
        </div>
      </form>

      <p class="mt-10 text-center text-sm/6 text-gray-500">
        Don’t have an account?
        <RouterLink to="/register" class="font-semibold text-indigo-600 hover:text-indigo-500">Sign Up</RouterLink>
      </p>
    </div>
  </div>
</template>
