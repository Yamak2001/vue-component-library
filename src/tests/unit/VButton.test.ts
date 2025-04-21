import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import VButton from '@/components/core/VButton/VButton.vue';

describe('VButton.vue', () => {
  // Test rendering
  it('renders the button correctly with default props', () => {
    const wrapper = mount(VButton);
    expect(wrapper.element.tagName).toBe('BUTTON');
    expect(wrapper.attributes('type')).toBe('button');
    expect(wrapper.classes()).toContain('bg-brand-primary');
  });
  
  // Test slot content
  it('renders slot content correctly', () => {
    const wrapper = mount(VButton, {
      slots: {
        default: 'Test Button'
      }
    });
    expect(wrapper.text()).toBe('Test Button');
  });
  
  // Test with different variants
  it('applies the correct classes for different variants', () => {
    const primaryWrapper = mount(VButton, { props: { variant: 'primary' } });
    expect(primaryWrapper.classes()).toContain('bg-brand-primary');
    
    const secondaryWrapper = mount(VButton, { props: { variant: 'secondary' } });
    expect(secondaryWrapper.classes()).toContain('bg-neutral-200');
    
    const dangerWrapper = mount(VButton, { props: { variant: 'danger' } });
    expect(dangerWrapper.classes()).toContain('bg-status-danger');
  });
  
  // Test sizes
  it('applies the correct classes for different sizes', () => {
    const smWrapper = mount(VButton, { props: { size: 'sm' } });
    expect(smWrapper.classes()).toContain('h-8');
    
    const lgWrapper = mount(VButton, { props: { size: 'lg' } });
    expect(lgWrapper.classes()).toContain('h-12');
  });
  
  // Test disabled state
  it('has correct disabled attributes when disabled', () => {
    const wrapper = mount(VButton, { props: { disabled: true } });
    expect(wrapper.attributes('disabled')).toBeDefined();
    expect(wrapper.attributes('aria-disabled')).toBe('true');
    expect(wrapper.classes()).toContain('opacity-50');
  });
  
  // Test loading state
  it('shows loading spinner when loading', () => {
    const wrapper = mount(VButton, { props: { loading: true } });
    expect(wrapper.find('.animate-spin').exists()).toBe(true);
    expect(wrapper.attributes('disabled')).toBeDefined();
    expect(wrapper.attributes('aria-busy')).toBe('true');
  });
  
  // Test click event
  it('emits click event when clicked', async () => {
    const wrapper = mount(VButton);
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeTruthy();
    expect(wrapper.emitted('click')?.length).toBe(1);
  });
  
  // Test no click event when disabled
  it('does not emit click when disabled', async () => {
    const wrapper = mount(VButton, { props: { disabled: true } });
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeFalsy();
  });
  
  // Test no click event when loading
  it('does not emit click when loading', async () => {
    const wrapper = mount(VButton, { props: { loading: true } });
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeFalsy();
  });
  
  // Test focus and blur events
  it('emits focus and blur events', async () => {
    const wrapper = mount(VButton);
    await wrapper.trigger('focus');
    expect(wrapper.emitted('focus')).toBeTruthy();
    
    await wrapper.trigger('blur');
    expect(wrapper.emitted('blur')).toBeTruthy();
  });
  
  // Test block mode
  it('applies full width in block mode', () => {
    const wrapper = mount(VButton, { props: { block: true } });
    expect(wrapper.classes()).toContain('w-full');
  });
  
  // Test rounded mode
  it('applies rounded-full class when rounded prop is true', () => {
    const wrapper = mount(VButton, { props: { rounded: true } });
    expect(wrapper.classes()).toContain('rounded-full');
  });
  
  // Test icon mode
  it('applies correct classes in icon mode', () => {
    const wrapper = mount(VButton, { props: { icon: true, size: 'md' } });
    expect(wrapper.classes()).toContain('w-10');
    expect(wrapper.classes()).toContain('h-10');
  });
  
  // Test a11y attributes
  it('correctly passes through a11y attributes', () => {
    const wrapper = mount(VButton, {
      props: {
        ariaLabel: 'Test Label',
        ariaControls: 'test-id',
        ariaExpanded: true
      }
    });
    
    expect(wrapper.attributes('aria-label')).toBe('Test Label');
    expect(wrapper.attributes('aria-controls')).toBe('test-id');
    expect(wrapper.attributes('aria-expanded')).toBe('true');
  });
});