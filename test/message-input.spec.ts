import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ElementPlus from 'element-plus';
import MessageInput from '../src/components/MessageInput.vue';

describe('MessageInput', () => {
  it('renders actions and emits send', async () => {
    const wrapper = mount(MessageInput, {
      props: { disabled: false },
      global: { plugins: [ElementPlus] },
    });

    expect(wrapper.find('input[type="file"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="send"]').exists()).toBe(true);

    await wrapper.find('textarea').setValue(' hi ');
    await wrapper.find('[data-test="send"]').trigger('click');
    expect(wrapper.emitted('send')?.[0]).toEqual(['hi']);
    expect((wrapper.find('textarea').element as HTMLTextAreaElement).value).toBe('');
  });
});
