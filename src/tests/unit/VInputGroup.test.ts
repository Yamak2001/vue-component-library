// tests/unit/VInputGroup.test.ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import VInputGroup from '@/components/composite/VInputGroup/VInputGroup.vue';

describe('VInputGroup.vue', () => {
  it('renders the label and input', () => {
    const wrapper = mount(VInputGroup, {
      props: {
        label: 'Username',
        name: 'username'
      }
    });
    
    expect(wrapper.find('label').text()).toContain('Username');
    expect(wrapper.find('input').exists()).toBe(true);
  });
  
  it('shows required asterisk when required', () => {
    const wrapper = mount(VInputGroup, {
      props: {
        label: 'Username',
        required: true
      }
    });
    
    expect(wrapper.find('label').html()).toContain('<span class="text-red-500">*</span>');
  });
  
  it('displays helper text', () => {
    const wrapper = mount(VInputGroup, {
      props: {
        helperText: 'Enter your username'
      }
    });
    
    expect(wrapper.find('p').text()).toBe('Enter your username');
  });
  
  it('displays error message when invalid', () => {
    const wrapper = mount(VInputGroup, {
      props: {
        validated: true,
        valid: false,
        errorMessage: 'Username is required'
      }
    });
    
    expect(wrapper.find('p').text()).toBe('Username is required');
    expect(wrapper.find('p').classes()).toContain('text-red-600');
  });
  
  it('displays success message when valid', () => {
    const wrapper = mount(VInputGroup, {
      props: {
        validated: true,
        valid: true,
        successMessage: 'Username is available'
      }
    });
    
    expect(wrapper.find('p').text()).toBe('Username is available');
    expect(wrapper.find('p').classes()).toContain('text-green-600');
  });
  
  it('forwards events from input', async () => {
    const wrapper = mount(VInputGroup);
    
    await wrapper.find('input').setValue('test');
    expect(wrapper.emitted('update:value')?.[0]).toEqual(['test']);
    
    await wrapper.find('input').trigger('focus');
    expect(wrapper.emitted('focus')).toBeTruthy();
  });
});