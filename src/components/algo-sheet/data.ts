import { Topic } from "./types";

export const DUMMY_DATA: Topic[] = [
  {
    id: "t1",
    title: "Two Pointers",
    userId: "dummy-user",
    questions: [],
    subtopics: [
      {
        id: "st1-1",
        title: "Arrays",
        topicId: "t1",
        questions: [
          {
            id: "q1",
            title: "Two Sum II - Input Array Is Sorted",
            level: "Medium",
            link: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/",
            solvedCount: 0,
            hint: "The array is sorted — initialize a left and right pointer. If the sum is too large, move right left; if too small, move left right.",
            hintFormat: "Text",
            topicId: "t1",
            subtopicId: "st1-1",
            codes: [
              {
                id: "c1",
                language: "C++",
                questionId: "q1",
                code: `class Solution {
public:
    vector<int> twoSum(vector<int>& numbers, int target) {
        int l = 0, r = numbers.size() - 1;
        while (l < r) {
            if (numbers[l] + numbers[r] == target) return {l+1, r+1};
            else if (numbers[l] + numbers[r] < target) l++;
            else r--;
        }
        return {};
    }
};`,
              },
              {
                id: "c2",
                language: "Python",
                questionId: "q1",
                code: `class Solution:
    def twoSum(self, numbers: List[int], target: int) -> List[int]:
        l, r = 0, len(numbers) - 1
        while l < r:
            s = numbers[l] + numbers[r]
            if s == target: return [l+1, r+1]
            elif s < target: l += 1
            else: r -= 1
        return []`,
              },
            ],
          },
          {
            id: "q2",
            title: "Remove Duplicates from Sorted Array",
            level: "Easy",
            link: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/",
            solvedCount: 0,
            hint: "Duplicates are adjacent. Use a slow pointer for unique elements and a fast pointer to scan forward.",
            hintFormat: "Text",
            topicId: "t1",
            subtopicId: "st1-1",
            codes: [
              {
                id: "c3",
                language: "Java",
                questionId: "q2",
                code: `class Solution {
    public int removeDuplicates(int[] nums) {
        if (nums.length == 0) return 0;
        int i = 0;
        for (int j = 1; j < nums.length; j++) {
            if (nums[j] != nums[i]) {
                i++;
                nums[i] = nums[j];
            }
        }
        return i + 1;
    }
}`,
              },
            ],
          },
        ],
      },
      {
        id: "st1-2",
        title: "Linked Lists",
        topicId: "t1",
        questions: [
          {
            id: "q3",
            title: "Linked List Cycle",
            level: "Easy",
            link: "https://leetcode.com/problems/linked-list-cycle/",
            solvedCount: 0,
            hint: "Use Floyd's Cycle-Finding Algorithm — slow moves one step, fast moves two. If they meet, there's a cycle.",
            hintFormat: "Text",
            topicId: "t1",
            subtopicId: "st1-2",
            codes: [
              {
                id: "c4",
                language: "C++",
                questionId: "q3",
                code: `class Solution {
public:
    bool hasCycle(ListNode *head) {
        ListNode *slow = head, *fast = head;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
            if (slow == fast) return true;
        }
        return false;
    }
};`,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "t2",
    title: "Sliding Window",
    userId: "dummy-user",
    questions: [],
    subtopics: [
      {
        id: "st2-1",
        title: "Fixed Window",
        topicId: "t2",
        questions: [
          {
            id: "q4",
            title: "Maximum Average Subarray I",
            level: "Easy",
            link: "https://leetcode.com/problems/maximum-average-subarray-i/",
            solvedCount: 0,
            hint: "Compute the sum of the first k elements, then slide: subtract the outgoing element and add the incoming one.",
            hintFormat: "Text",
            topicId: "t2",
            subtopicId: "st2-1",
            codes: [
              {
                id: "c5",
                language: "JavaScript",
                questionId: "q4",
                code: `var findMaxAverage = function(nums, k) {
    let sum = 0;
    for (let i = 0; i < k; i++) sum += nums[i];
    let max = sum;
    for (let i = k; i < nums.length; i++) {
        sum = sum - nums[i - k] + nums[i];
        max = Math.max(max, sum);
    }
    return max / k;
};`,
              },
            ],
          },
        ],
      },
      {
        id: "st2-2",
        title: "Variable Window",
        topicId: "t2",
        questions: [
          {
            id: "q5",
            title: "Longest Substring Without Repeating Characters",
            level: "Medium",
            link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
            solvedCount: 0,
            hint: "Use a hash set for the window. When a duplicate is found, shrink from the left until it's removed.",
            hintFormat: "Text",
            topicId: "t2",
            subtopicId: "st2-2",
            codes: [
              {
                id: "c6",
                language: "Python",
                questionId: "q5",
                code: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        char_set = set()
        l = 0
        res = 0
        for r in range(len(s)):
            while s[r] in char_set:
                char_set.remove(s[l])
                l += 1
            char_set.add(s[r])
            res = max(res, r - l + 1)
        return res`,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "t3",
    title: "Binary Search",
    userId: "dummy-user",
    questions: [
      {
        id: "q-bs-1",
        title: "704. Binary Search (Standard)",
        level: "Easy",
        link: "https://leetcode.com/problems/binary-search/",
        solvedCount: 0,
        hint: "Find the middle element. If target < mid search left, if target > mid search right, repeat until found or bounds cross.",
        hintFormat: "Text",
        topicId: "t3",
        subtopicId: null,
        codes: [
          {
            id: "c7",
            language: "Python",
            questionId: "q-bs-1",
            code: `class Solution:
    def search(self, nums: List[int], target: int) -> int:
        l, r = 0, len(nums) - 1
        while l <= r:
            m = (l + r) // 2
            if nums[m] == target: return m
            elif nums[m] < target: l = m + 1
            else: r = m - 1
        return -1`,
          },
        ],
      },
    ],
    subtopics: [
      {
        id: "st3-1",
        title: "Search Space: Array",
        topicId: "t3",
        questions: [
          {
            id: "q6",
            title: "Search in Rotated Sorted Array",
            level: "Hard",
            link: "https://leetcode.com/problems/search-in-rotated-sorted-array/",
            solvedCount: 0,
            hint: "One half is always sorted. Check which half, then determine if the target lies within it to decide which side to discard.",
            hintFormat: "Text",
            topicId: "t3",
            subtopicId: "st3-1",
            codes: [
              {
                id: "c8",
                language: "Java",
                questionId: "q6",
                code: `class Solution {
    public int search(int[] nums, int target) {
        int l = 0, r = nums.length - 1;
        while (l <= r) {
            int mid = l + (r - l) / 2;
            if (nums[mid] == target) return mid;
            if (nums[l] <= nums[mid]) {
                if (target >= nums[l] && target < nums[mid]) r = mid - 1;
                else l = mid + 1;
            } else {
                if (target > nums[mid] && target <= nums[r]) l = mid + 1;
                else r = mid - 1;
            }
        }
        return -1;
    }
}`,
              },
            ],
          },
        ],
      },
    ],
  },
];
