

# MD RAFI কে অ্যাডমিন রোল দেওয়া

## বর্তমান অবস্থা
- **নাম:** MD RAFI
- **ইমেইল:** aabeg01@gmail.com
- **User ID:** `9f4bf37a-a1da-4ba5-a5cb-ff3eefad07d4`
- **বর্তমান রোল:** `user`

## পরিবর্তন
`user_roles` টেবিলে বর্তমান `user` রোলটি `admin` এ আপডেট করা হবে।

## Technical Details

**SQL Command:**
```sql
UPDATE public.user_roles 
SET role = 'admin' 
WHERE user_id = '9f4bf37a-a1da-4ba5-a5cb-ff3eefad07d4';
```

এই আপডেটের পর আপনি `/admin` ড্যাশবোর্ডে লগইন করে সব ফিচার অ্যাক্সেস করতে পারবেন।

