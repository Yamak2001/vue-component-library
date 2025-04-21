// tests/unit/VInput.test.ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import VInput from '@/components/core/VInput/VInput.vue';

describe('VInput.vue', () => {
  // Test rendering
  it('renders the input correctly with default props', () => {
    const wrapper = mount(VInput);
    const input = wrapper.find('input');
    expect(input.exists()).toBe(true);
    expect(input.attributes('type')).toBe('text');
  });
  
  // Test with different types
  it('applies the correct type attribute', () => {
    const wrapper = mount(VInput, { props: { type: 'email' } });
    expect(wrapper.find('input').attributes('type')).toBe('email');
  });
  
  // Test value binding
  it('updates the model value when input changes', async () => {
    const wrapper = mount(VInput, {
      props: {
        'onUpdate:value': (e) => wrapper.setProps({ value: e })
      }
    });
    
    const input = wrapper.find('input');
    await input.setValue('test value');
    
    expect(wrapper.emitted('update:value')?.[0]).toEqual(['test value']);
  });
  
  // Test disabled state
  it('applies disabled attribute when disabled', () => {
    const wrapper = mount(VInput, { props: { disabled: true } });
    expect(wrapper.find('input').attributes('disabled')).toBeDefined();
  });
  
  // Test loading state
  it('shows loading spinner when loading', () => {
    const wrapper = mount(VInput, { props: { loading: true } });
    expect(wrapper.find('.animate-spin').exists()).toBe(true);
  });
  
  // Test slots
  it('renders prefix and suffix slots', () => {
    const wrapper = mount(VInput, {
      slots: {
        prefix: '<span data-test="prefix">Prefix</span>',
        suffix: '<span data-test="suffix">Suffix</span>'
      }
    });
    
    expect(wrapper.find('[data-test="prefix"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="suffix"]').exists()).toBe(true);
  });
  
  // Test focus and blur events
  it('emits focus and blur events', async () => {
    const wrapper = mount(VInput);
    const input = wrapper.find('input');
    
    await input.trigger('focus');
    expect(wrapper.emitted('focus')).toBeTruthy();
    
    await input.trigger('blur');
    expect(wrapper.emitted('blur')).toBeTruthy();
  });
});