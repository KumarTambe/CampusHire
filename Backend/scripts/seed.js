/**
 * Seeds a demo dataset: one admin, verified recruiters with jobs, and students
 * with applications. Safe to re-run — it wipes and rebuilds the demo records.
 *
 *   npm run seed
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { connectDB } from '../db/db.js'
import User from '../models/User.js'
import Job from '../models/Job.js'
import Application from '../models/Application.js'
import Notification from '../models/Notification.js'
import AuditLog from '../models/AuditLog.js'

const PASSWORD = 'password123'

async function run() {
    await connectDB()
    await Promise.all([
        User.deleteMany({}), Job.deleteMany({}),
        Application.deleteMany({}), Notification.deleteMany({}), AuditLog.deleteMany({}),
    ])

    const hash = await bcrypt.hash(PASSWORD, 10)

    const admin = await User.create({
        firstName: 'Aarav', lastName: 'Menon', email: 'admin@campushire.dev',
        password: hash, role: 'admin',
    })

    const recruiters = await User.create([
        {
            firstName: 'Priya', lastName: 'Sharma', email: 'priya@nimbus.dev',
            password: hash, role: 'recruiter', verificationStatus: 'verified',
            companyName: 'Nimbus Labs', companyWebsite: 'https://nimbus.dev',
            companyDescription: 'Cloud infrastructure tooling for modern engineering teams.',
        },
        {
            firstName: 'Rohit', lastName: 'Verma', email: 'rohit@quanta.io',
            password: hash, role: 'recruiter', verificationStatus: 'verified',
            companyName: 'Quanta Systems', companyWebsite: 'https://quanta.io',
            companyDescription: 'Applied machine learning for industrial automation.',
        },
        {
            firstName: 'Neha', lastName: 'Kulkarni', email: 'neha@orbitpay.com',
            password: hash, role: 'recruiter', verificationStatus: 'pending',
            companyName: 'OrbitPay', companyWebsite: 'https://orbitpay.com',
            companyDescription: 'Payments infrastructure for emerging markets.',
        },
    ])

    const students = await User.create([
        {
            firstName: 'Ishaan', lastName: 'Gupta', email: 'ishaan@student.dev',
            password: hash, role: 'student', cgpa: 8.6, branch: 'CSE',
            graduationYear: 2026, college: 'IIT Bombay',
            skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
        },
        {
            firstName: 'Ananya', lastName: 'Rao', email: 'ananya@student.dev',
            password: hash, role: 'student', cgpa: 9.1, branch: 'ECE',
            graduationYear: 2026, college: 'NIT Trichy',
            skills: ['Python', 'PyTorch', 'C++'],
        },
        {
            firstName: 'Kabir', lastName: 'Shah', email: 'kabir@student.dev',
            password: hash, role: 'student', cgpa: 6.4, branch: 'MECH',
            graduationYear: 2027, college: 'VIT Vellore',
            skills: ['SolidWorks', 'MATLAB'],
        },
    ])

    const soon = (days) => new Date(Date.now() + days * 864e5)

    const jobs = await Job.create([
        {
            title: 'Software Engineer — Platform',
            description: 'Build and scale the services that power Nimbus deployments. You will work across Node.js services, our React console and the Kubernetes control plane, owning features end to end alongside a small senior team.',
            postedBy: recruiters[0]._id, status: 'published',
            requiredSkills: ['Node.js', 'React', 'MongoDB'],
            applicationDeadline: soon(30), location: 'Bengaluru, India',
            jobType: 'full-time', salary: '₹18–24 LPA',
            eligibility: { minCGPA: 7.5, allowedBranches: ['CSE', 'IT', 'ECE'], graduationYear: 2026 },
        },
        {
            title: 'Frontend Engineer Intern',
            description: 'A six month internship on the design systems team. Expect real ownership: you will ship components used across every Nimbus surface, pair with designers weekly and help shape our accessibility standards.',
            postedBy: recruiters[0]._id, status: 'published',
            requiredSkills: ['React', 'Tailwind CSS', 'TypeScript'],
            applicationDeadline: soon(18), location: 'Remote',
            jobType: 'internship', salary: '₹60,000 / month',
            eligibility: { minCGPA: 7.0, allowedBranches: ['CSE', 'IT'] },
        },
        {
            title: 'Machine Learning Engineer',
            description: 'Join the perception team building vision models for factory-floor automation. Strong fundamentals in linear algebra and hands-on PyTorch experience matter more to us than years on a resume.',
            postedBy: recruiters[1]._id, status: 'published',
            requiredSkills: ['Python', 'PyTorch', 'Computer Vision'],
            applicationDeadline: soon(25), location: 'Pune, India',
            jobType: 'full-time', salary: '₹22–30 LPA',
            eligibility: { minCGPA: 8.0, allowedBranches: ['CSE', 'ECE', 'EEE'], graduationYear: 2026 },
        },
        {
            title: 'Embedded Systems Engineer',
            description: 'Own firmware for our next generation controller boards, from bring-up through field deployment. Hands-on C, RTOS familiarity and a taste for debugging with an oscilloscope nearby.',
            postedBy: recruiters[1]._id, status: 'draft',
            requiredSkills: ['C', 'RTOS', 'Embedded Linux'],
            applicationDeadline: soon(40), location: 'Hyderabad, India',
            jobType: 'full-time',
            eligibility: { minCGPA: 7.0, allowedBranches: ['ECE', 'EEE'] },
        },
    ])

    // Ishaan → Platform role, already shortlisted
    const app1 = await Application.create({
        student: students[0]._id, job: jobs[0]._id, status: 'shortlisted',
        eligibilitySnapshot: { cgpa: 8.6, branch: 'CSE', graduationYear: 2026 },
    })
    await AuditLog.create({
        application: app1._id, changedBy: recruiters[0]._id, changedByRole: 'recruiter',
        oldStatus: 'applied', newStatus: 'shortlisted', reason: 'Strong full-stack project work',
    })
    await Notification.create({
        user: students[0]._id, application: app1._id,
        message: `Your application for "${jobs[0].title}" moved from applied to shortlisted.`,
    })

    // Ananya → ML role, fresh application
    const app2 = await Application.create({
        student: students[1]._id, job: jobs[2]._id, status: 'applied',
        eligibilitySnapshot: { cgpa: 9.1, branch: 'ECE', graduationYear: 2026 },
    })
    await Notification.create({
        user: recruiters[1]._id, application: app2._id,
        message: `Ananya Rao applied to your job "${jobs[2].title}".`,
    })

    console.log(`
Seed complete. All demo accounts use the password: ${PASSWORD}

  admin      admin@campushire.dev
  recruiter  priya@nimbus.dev     (verified, 2 published jobs)
  recruiter  neha@orbitpay.com    (pending verification)
  student    ishaan@student.dev   (CSE, 8.6 CGPA, 2026)
  student    kabir@student.dev    (MECH, 6.4 CGPA, 2027 — ineligible for most)
`)
    await mongoose.connection.close()
}

run().catch(err => { console.error(err); process.exit(1) })
