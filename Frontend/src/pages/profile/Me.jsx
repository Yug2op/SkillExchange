import { useMe } from '@/hooks/useMe';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Star, Calendar, Award, Edit3, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MeProfile() {
  const { data: user, isLoading, isError } = useMe();


  if (isLoading) return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 dark:to-indigo-900 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );

  if (isError || !user) return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-red-900 flex items-center justify-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <motion.div 
          className="text-6xl mb-4"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          😵
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
        <p className="text-gray-600">Please log in to view your profile</p>
      </div>
    </motion.div>
  );

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <motion.h1 
              className="text-3xl font-bold text-gray-800 dark:text-gray-100"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              My Profile
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link 
                to="/profile/edit" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 hover:scale-105"
              >
                <Edit3 className="w-5 h-5" />
                Edit Profile
              </Link>
            </motion.div>
          </div>

          {/* Profile Header */}
          <motion.div 
            className="flex items-start gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Avatar */}
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={user?.profilePic?.url || `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=random`}
                alt={user.name}
                loading="lazy"
                className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
              />
              <motion.div 
                className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 border-4 border-white dark:border-gray-800"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </motion.div>
            </motion.div>

            {/* Basic Info */}
            <motion.div 
              className="flex-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <motion.h2 
                className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {user.name}
              </motion.h2>
              <motion.p 
                className="text-gray-600 dark:text-gray-400 mb-4 flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {user.email}
              </motion.p>

              {/* Rating */}
              <motion.div 
                className="flex items-center gap-2 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.7 + (i * 0.1) }}
                    >
                      <Star
                        className={`w-5 h-5 ${i < Math.floor(user.rating?.average || 0)
                            ? 'text-yellow-400 fill-current'
                          : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </motion.div>
                  ))}
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  {user.rating?.average?.toFixed(1) || '0.0'} ({user.rating?.count || 0} reviews)
                </span>
              </motion.div>

              {/* Location */}
              {(user.location?.city || user.location?.country) && (
                <motion.div 
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <MapPin className="w-5 h-5" />
                  <span>
                    {[user.location.city, user.location.country].filter(Boolean).join(', ')}
                  </span>
                </motion.div>
              )}

              {/* Phone */}
              {user.phone && (
                <motion.div 
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                >
                  <Phone className="w-5 h-5" />
                  <span>{user.phone}</span>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Profile Details */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Bio Section */}
          <motion.div 
            className="bg-white rounded-2xl shadow-lg p-6 dark:bg-gray-800 dark:shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2 dark:text-white">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              About Me
            </h3>
            <motion.p 
              className="text-gray-600 leading-relaxed dark:text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              {user.bio || 'No bio provided yet.'}
            </motion.p>
          </motion.div>

          {/* Skills Section */}
          <motion.div 
            className="bg-white rounded-2xl shadow-lg p-6 dark:bg-gray-800 dark:shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2 dark:text-white">
              <Award className="w-6 h-6 text-indigo-600" />
              Skills & Interests
            </h3>

            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {/* Skills Section */}
              <motion.div
                className="bg-white rounded-2xl shadow-lg p-6 dark:bg-gray-800 dark:shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
          >
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2 dark:text-white">
              <Award className="w-6 h-6 text-indigo-600" />
              Skills & Interests
            </h3>
            
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {/* Skills to Teach */}
              <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2 dark:text-gray-300">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Skills I Teach
                </h4>
                <motion.div 
                  className="flex flex-wrap gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  {(user.skillsToTeach || []).length > 0 ? (
                    (user.skillsToTeach || []).map((skillObj, index) => (
                      <motion.span
                        key={index}
                            className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium dark:bg-green-900/30 dark:text-green-300"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.8 + (index * 0.1) }}
                        whileHover={{ scale: 1.05 }}
                      >
                        {skillObj.skill}
                            {/* FIX: Smaller text for the level */}
                            <span className="ml-1 text-xs opacity-75">
                              ({skillObj.level})
                            </span>
                      </motion.span>
                    ))
                  ) : (
                        <span className="text-gray-500 text-sm italic dark:text-gray-400">No skills listed</span>
                  )}
                </motion.div>
              </div>

              {/* Skills to Learn */}
              <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2 dark:text-gray-300">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Skills I Want to Learn
                </h4>
                <motion.div 
                  className="flex flex-wrap gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                >
                  {(user.skillsToLearn || []).length > 0 ? (
                    (user.skillsToLearn || []).map((skillObj, index) => (
                      <motion.span
                        key={index}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium dark:bg-blue-900/30 dark:text-blue-300"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 1.0 + (index * 0.1) }}
                        whileHover={{ scale: 1.05 }}
                      >
                        {skillObj.skill}
                            {/* FIX: Smaller text for the level */}
                            <span className="ml-1 text-xs opacity-75">
                              ({skillObj.level})
                            </span>
                      </motion.span>
                    ))
                  ) : (
                        <span className="text-gray-500 text-sm italic dark:text-gray-400">No skills listed</span>
                  )}
                </motion.div>
              </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div 
          className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Activity Overview
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: user.rating?.count || 0, label: 'Reviews', color: 'indigo' },
              { value: user.rating?.average?.toFixed(1) || '0.0', label: 'Rating', color: 'green' },
              { value: new Date(user.createdAt).getFullYear(), label: 'Member Since', color: 'blue' },
              { value: user.isEmailVerified ? 'Verified' : 'Pending', label: 'Email Status', color: 'yellow' }].map((stat, index) => (
              <motion.div 
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + (index * 0.1) }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div 
                    className={`text-3xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400 mb-2`}
                  whileHover={{ scale: 1.1 }}
                >
                  {stat.value}
                </motion.div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          className="mt-8 flex gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link 
              to="/profile/edit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
            >
              <Edit3 className="w-5 h-5" />
              Edit Profile
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link 
              to="/change-password"
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
            >
              <Lock className="w-5 h-5" />
              Change Password
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}