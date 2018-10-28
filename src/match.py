import cv2
import mss
import numpy as np
import time

scale = 50
width = scale * 16
height = scale * 9

with mss.mss() as sct:
	monitor = {"top": 60, "left": 65, "width": width, "height": height}
	last_time = 0
	while "Screen capturing":
		#print fps
		fps = int(1/(time.time() - last_time))
		print('{} fps'.format(fps))
		last_time = time.time()


		MIN_MATCHES = 15
		cap = np.array(sct.grab(monitor))

		model = cv2.imread('imgs/stripe.jpeg', 0)
		# ORB keypoint detector
		orb = cv2.ORB_create()              
		# create brute force  matcher object
		bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)  
		# Compute model keypoints and its descriptors
		kp_model, des_model = orb.detectAndCompute(model, None)  
		# Compute scene keypoints and its descriptors
		kp_frame, des_frame = orb.detectAndCompute(cap, None)
		# Match frame descriptors with model descriptors
		matches = bf.match(des_model, des_frame)
		# Sort them in the order of their distance
		matches = sorted(matches, key=lambda x: x.distance)

		# assuming matches stores the matches found and 
		# returned by bf.match(des_model, des_frame)
		# differenciate between source points and destination points
		src_pts = np.float32([kp_model[m.queryIdx].pt for m in matches]).reshape(-1, 1, 2)
		dst_pts = np.float32([kp_frame[m.trainIdx].pt for m in matches]).reshape(-1, 1, 2)
		# compute Homography
		M, mask = cv2.findHomography(dst_pts, src_pts, cv2.RANSAC, 5.0)

		# Draw a rectangle that marks the found model in the frame
		h, w = model.shape
		pts = np.float32([[0, 0], [0, h - 1], [w - 1, h - 1], [w - 1, 0]]).reshape(-1, 1, 2)
		# project corners into frame
		dst = cv2.perspectiveTransform(pts, M)
		# connect them with lines

		img3 = cv2.warpPerspective(cap,M,(w, h))

		cv2.imshow('frame', img3)

		if cv2.waitKey(25) & 0xFF == ord("q"):
			cv2.destroyAllWindows()
			break

