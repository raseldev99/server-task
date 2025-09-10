<script setup>
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import {publicApi} from "@/services/axious.js";
import apis from "@/services/apis.js";
import { toast } from 'vue3-toastify';
import { useRouter } from "vue-router";
import {ref} from "vue";
import Button from 'primevue/button';



const router = useRouter();
const loading = ref(false);

const { errors, handleSubmit, defineField,setErrors } = useForm({
  validationSchema: yup.object({
    name: yup.string().required('Name is required'),
    email: yup.string().email().required('Email is required'),
    password: yup.string().min(6).required("Password is required"),
    password_confirmation: yup.string().oneOf([yup.ref('password')], 'Password must match')
        .required('Confirm Password is required'),
  }),
});

// Creates a submission handler
const onSubmit = handleSubmit(async (values) => {
  loading.value = true;
  try {
    const {} = await publicApi.post(apis.register, values);
    toast.success('Register successfully.');
    await router.push('/');
  } catch (error) {
     if (error.status === 422){
       setErrors(error.response.data.errors || {});
     }else {
       toast.error(error.response.data.message || "Something went wrong");
     }
  }finally {
    loading.value = false;
  }
});
const [name, nameAttrs] = defineField('name');
const [email, emailAttrs] = defineField('email');
const [password, passwordAttrs] = defineField('password');
const [password_confirmation, confirmPasswordAttrs] = defineField('password_confirmation');
</script>

<template>
  <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Sign Up</h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form class="space-y-4" @submit="onSubmit">
        <div>
          <label for="name" class="block text-sm/6 font-medium text-gray-900">Name</label>
          <div class="mt-2">
            <input type="text" name="name" id="name" v-model="name" v-bind="nameAttrs" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
            <p class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
          </div>
        </div>
        <div>
          <label for="email" class="block text-sm/6 font-medium text-gray-900">Email address</label>
          <div class="mt-2">
            <input type="email" name="email" id="email" v-model="email" autocomplete="email" v-bind="emailAttrs" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
            <p class="text-red-500 text-sm mt-1">{{ errors.email }}</p>
          </div>
        </div>
        <div>
          <div class="flex items-center justify-between">
            <label for="password" class="block text-sm/6 font-medium text-gray-900">Password</label>
          </div>
          <div class="mt-2">
            <input type="password" name="password" id="password" v-model="password" autocomplete="current-password" v-bind="passwordAttrs" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
            <p class="text-red-500 text-sm mt-1">{{ errors.password }}</p>
          </div>
        </div>
        <div>
          <div class="flex items-center justify-between">
            <label for="confirm-password" class="block text-sm/6 font-medium text-gray-900">Confirm Password</label>
          </div>
          <div class="mt-2">
            <input type="password" name="confirm-password" id="confirm-password" v-model="password_confirmation" v-bind="confirmPasswordAttrs" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
            <p class="text-red-500 text-sm mt-1">{{ errors.password_confirmation }}</p>
          </div>
        </div>
        <div>
<!--          <button type="submit" class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Sign Up</button>-->
          <Button type="submit" label="Sign Up" icon="pi pi-search" :loading="loading" />
        </div>
      </form>

      <p class="mt-10 text-center text-sm/6 text-gray-500">
        Already have an account?
        <RouterLink to="/" class="font-semibold text-indigo-600 hover:text-indigo-500">Login</RouterLink>
      </p>
    </div>
  </div>
</template>

