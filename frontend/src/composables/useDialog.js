import { ref } from 'vue';

export function useDialog() {
    const visible = ref(false);
    const data = ref(null);

    const open = (initialData = null) => {
        data.value = initialData;
        visible.value = true;
    };

    const close = () => {
        visible.value = false;
        data.value = null;
    };

    const reset = () => {
        data.value = null;
    };

    return {
        visible,
        data,
        open,
        close,
        reset
    };
}