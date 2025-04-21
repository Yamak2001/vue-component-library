import { describe, it, expect, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import VButtonGroup from '@/components/composite/VButtonGroup/VButtonGroup.vue';
import VButtonGroupItem from '@/components/composite/VButtonGroup/VButtonGroupItem.vue';

describe('VButtonGroup.vue', () => {
  // Setup reusable wrappers with proper typing
  let singleSelectWrapper: VueWrapper;
  let multiSelectWrapper: VueWrapper;
  
  beforeEach(() => {
    // Create a single select button group
    singleSelectWrapper = mount(VButtonGroup, {
      props: {
        selectable: true,
        multiple: false,
        modelValue: '2'
      },
      slots: {
        default: [
          '<VButtonGroupItem value="1">Option 1</VButtonGroupItem>',
          '<VButtonGroupItem value="2">Option 2</VButtonGroupItem>',
          '<VButtonGroupItem value="3">Option 3</VButtonGroupItem>'
        ]
      },
      global: {
        components: {
          VButtonGroupItem
        }
      }
    });
    
    // Create a multi select button group
    multiSelectWrapper = mount(VButtonGroup, {
      props: {
        selectable: true,
        multiple: true,
        modelValue: ['1', '3']
      },
      slots: {
        default: [
          '<VButtonGroupItem value="1">Option 1</VButtonGroupItem>',
          '<VButtonGroupItem value="2">Option 2</VButtonGroupItem>',
          '<VButtonGroupItem value="3">Option 3</VButtonGroupItem>'
        ]
      },
      global: {
        components: {
          VButtonGroupItem
        }
      }
    });
  });
  
  // Test rendering
  it('renders the button group with correct classes', () => {
    const wrapper = mount(VButtonGroup);
    expect(wrapper.classes()).toContain('inline-flex');
    expect(wrapper.classes()).toContain('flex-row');
    expect(wrapper.attributes('role')).toBe('group');
  });
  
  // Test vertical orientation
  it('renders correctly with vertical orientation', () => {
    const wrapper = mount(VButtonGroup, {
      props: {
        vertical: true
      }
    });
    expect(wrapper.classes()).toContain('flex-col');
  });
  
  // Test disabled state
  it('applies disabled state correctly', () => {
    const wrapper = mount(VButtonGroup, {
      props: {
        disabled: true
      }
    });
    expect(wrapper.classes()).toContain('opacity-60');
    expect(wrapper.attributes('aria-disabled')).toBe('true');
  });
  
  // Test single selection mode
  it('handles single selection correctly', async () => {
    // Check initial selection
    const buttons = singleSelectWrapper.findAllComponents(VButtonGroupItem);
    
    // Use selected prop instead of active
    expect(buttons[1].props('selected')).toBe(true);
    
    // Click the first button to change selection
    await buttons[0].trigger('click');
    
    // Check that the correct update:modelValue event was emitted
    const emitted = singleSelectWrapper.emitted('update:modelValue');
    expect(emitted).toBeTruthy();
    if (emitted) {
      expect(emitted[0][0]).toBe('1');
    }
  });
  
  // Test clicking the already selected item in single mode should deselect it
  it('deselects item when clicking already selected item in single mode', async () => {
    const buttons = singleSelectWrapper.findAllComponents(VButtonGroupItem);
    
    // Click already selected button (Option 2)
    await buttons[1].trigger('click');
    
    // Check that the correct update:modelValue event was emitted with null value
    const emitted = singleSelectWrapper.emitted('update:modelValue');
    expect(emitted).toBeTruthy();
    if (emitted) {
      expect(emitted[0][0]).toBeNull();
    }
  });
  
  // Test multiple selection mode
  it('handles multiple selection correctly', async () => {
    // Check initial selection
    const buttons = multiSelectWrapper.findAllComponents(VButtonGroupItem);
    
    // Use selected prop instead of active
    expect(buttons[0].props('selected')).toBe(true);
    expect(buttons[1].props('selected')).toBe(false);
    expect(buttons[2].props('selected')).toBe(true);
    
    // Click the second button to add it to selection
    await buttons[1].trigger('click');
    
    // Check that correct update:modelValue event was emitted
    const emitted = multiSelectWrapper.emitted('update:modelValue');
    expect(emitted).toBeTruthy();
    if (emitted) {
      expect(emitted[0][0]).toEqual(['1', '3', '2']);
    
      // Reset emitted events
      emitted.length = 0;
    }
    
    // Update wrapper modelValue to simulate parent component update
    await multiSelectWrapper.setProps({ modelValue: ['1', '3', '2'] });
    
    // Click the first button to remove it from selection
    await buttons[0].trigger('click');
    
    // Check that correct update:modelValue event was emitted
    const emittedAfterRemoval = multiSelectWrapper.emitted('update:modelValue');
    expect(emittedAfterRemoval).toBeTruthy();
    if (emittedAfterRemoval) {
      expect(emittedAfterRemoval[0][0]).toEqual(['3', '2']);
    }
  });
  
  // Test empty slot
  it('renders empty slot when no buttons provided', () => {
    const wrapper = mount(VButtonGroup, {
      slots: {
        empty: 'No options available'
      }
    });
    expect(wrapper.text()).toBe('No options available');
  });
  
  // Test non-selectable mode
  it('does not handle selection when selectable is false', async () => {
    const wrapper = mount(VButtonGroup, {
      props: {
        selectable: false
      },
      slots: {
        default: [
          '<VButtonGroupItem value="1">Option 1</VButtonGroupItem>',
          '<VButtonGroupItem value="2">Option 2</VButtonGroupItem>'
        ]
      },
      global: {
        components: {
          VButtonGroupItem
        }
      }
    });
    
    const buttons = wrapper.findAllComponents(VButtonGroupItem);
    
    // Initial state - no selection
    expect(buttons[0].props('selected')).toBeFalsy();
    expect(buttons[1].props('selected')).toBeFalsy();
    
    // Click a button
    await buttons[0].trigger('click');
    
    // Should still have no selection
    expect(buttons[0].props('selected')).toBeFalsy();
    
    // Check for the correct event
    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });
});