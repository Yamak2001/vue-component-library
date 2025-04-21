// tests/unit/VAutoComplete.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import VAutoComplete from '@/components/smart/VAutoComplete/VAutoComplete.vue';
import { createMockAdapter } from '@/adapters/mockAdapter';

describe('VAutoComplete.vue', () => {
  // Sample options for client-side testing
  const options = [
    { value: 1, label: 'Apple' },
    { value: 2, label: 'Banana' },
    { value: 3, label: 'Cherry' },
    { value: 4, label: 'Date' },
    { value: 5, label: 'Elderberry' }
  ];
  
  // Mock adapter for server-side testing
  let mockAdapter;
  
  beforeEach(() => {
    mockAdapter = createMockAdapter();
    mockAdapter.setMockResponse('/search', 'GET', {
      data: [
        { id: 1, name: 'Apple' },
        { id: 2, name: 'Banana' },
        { id: 3, name: 'Cherry' }
      ]
    });
    
    // Mock timers for debounce testing
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it('renders the input field', () => {
    const wrapper = mount(VAutoComplete, {
      props: {
        placeholder: 'Search fruits'
      }
    });
    
    expect(wrapper.find('input').exists()).toBe(true);
    expect(wrapper.find('input').attributes('placeholder')).toBe('Search fruits');
  });
  
  it('shows options when typing (client-side)', async () => {
    const wrapper = mount(VAutoComplete, {
      props: {
        options,
        minChars: 1,
        fetchMode: 'client'
      }
    });
    
    // Type to search
    await wrapper.find('input').setValue('a');
    vi.runAllTimers(); // Run debounce timer
    await flushPromises();
    
    // Check if dropdown is open with correct options
    expect(wrapper.find('.v-autocomplete ul').exists()).toBe(true);
    expect(wrapper.findAll('li').length).toBe(3); // Apple, Banana, Date
  });
  
  it('selects an option when clicked', async () => {
    const wrapper = mount(VAutoComplete, {
      props: {
        options,
        minChars: 1,
        fetchMode: 'client'
      }
    });
    
    // Type to search
    await wrapper.find('input').setValue('a');
    vi.runAllTimers();
    await flushPromises();
    
    // Click the first option (Apple)
    await wrapper.findAll('li')[0].trigger('click');
    
    // Check the input value and emitted events
    expect(wrapper.find('input').element.value).toBe('Apple');
    expect(wrapper.emitted('update:value')?.[0]).toEqual([1]);
    expect(wrapper.emitted('update:selected')?.[0][0]).toEqual(options[0]);
  });
  
  it('works with server-side search', async () => {
    const wrapper = mount(VAutoComplete, {
      props: {
        adapter: mockAdapter,
        endpoint: '/search',
        minChars: 1,
        fetchMode: 'server'
      }
    });
    
    // Type to search
    await wrapper.find('input').setValue('a');
    vi.runAllTimers();
    await flushPromises();
    
    // Check if dropdown is open with correct options
    expect(wrapper.findAll('li').length).toBe(3); // All 3 results from mock
    expect(wrapper.findAll('li')[0].text()).toBe('Apple');
  });
  
  it('shows loading state', async () => {
    // Create a delayed mock adapter
    mockAdapter.setMockResponse('/search-slow', 'GET', async (requestConfig) => {
      // Add a delay to simulate network request
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        data: [{ id: 1, name: 'Apple' }]
      };
    });
    
    const wrapper = mount(VAutoComplete, {
      props: {
        adapter: mockAdapter,
        endpoint: '/search-slow',
        minChars: 1,
        fetchMode: 'server',
        loadingText: 'Searching...'
      }
    });
    
    // Type to search
    await wrapper.find('input').setValue('a');
    vi.runAllTimers();
    await flushPromises();
    
    // Should show loading state before results arrive
    expect(wrapper.text()).toContain('Searching...');
  });
  
  it('shows "no results" state', async () => {
    // Set up empty response
    mockAdapter.setMockResponse('/search-empty', 'GET', {
      data: []
    });
    
    const wrapper = mount(VAutoComplete, {
      props: {
        adapter: mockAdapter,
        endpoint: '/search-empty',
        minChars: 1,
        fetchMode: 'server',
        noResultsText: 'Nothing found'
      }
    });
    
    // Type to search
    await wrapper.find('input').setValue('xyz');
    vi.runAllTimers();
    await flushPromises();
    
    // Should show "no results" message
    expect(wrapper.text()).toContain('Nothing found');
  });
  
  it('enforces exact match when exactMatch is true', async () => {
    const wrapper = mount(VAutoComplete, {
      props: {
        options,
        minChars: 1,
        fetchMode: 'client',
        exactMatch: true
      }
    });
    
    // Type a non-matching value
    await wrapper.find('input').setValue('nonexistent');
    vi.runAllTimers();
    await flushPromises();
    
    // Blur the input to trigger validation
    await wrapper.find('input').trigger('blur');
    await flushPromises();
    
    // Input should be cleared since no exact match was found
    expect(wrapper.find('input').element.value).toBe('');
  });
  
  it('allows custom rendering of options via slot', async () => {
    const wrapper = mount(VAutoComplete, {
      props: {
        options,
        minChars: 1,
        fetchMode: 'client'
      },
      slots: {
        option: `
          <template #default="{ option }">
            <strong data-test="custom-option">{{ option.label.toUpperCase() }}</strong>
          </template>
        `
      }
    });
    
    // Type to search
    await wrapper.find('input').setValue('a');
    vi.runAllTimers();
    await flushPromises();
    
    // Should use custom rendering
    expect(wrapper.find('[data-test="custom-option"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="custom-option"]').text()).toBe('APPLE');
  });
});